import { randomUUID } from 'node:crypto';
import { afterAll, afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { auth } from '../../src/lib/auth.js';
import { sendEmail } from '../../src/lib/email.js';
import { prisma } from '../../src/lib/prisma.js';

// These tests exercise real Better Auth endpoints/hooks and PostgreSQL through
// auth.api. They do not test Express routing, HTTP rate limits, or Gmail delivery.
const originalPassword = 'Recovery-test-original-password-2026!';
const newPassword = 'Recovery-test-replacement-password-2026!';
const redirectTo = 'http://localhost:5173/reset-password';
const mockedSendEmail = vi.mocked(sendEmail);
let databaseVerified = false;
let fixtureEmails: string[] = [];
let fixtureUserIds: string[] = [];

beforeAll(async () => {
    // Refuse all fixture writes/cleanup unless this is the isolated test DB.
    expect(process.env.HOMEHUB_INTEGRATION_TEST).toBe('1');
    const url = new URL(process.env.DATABASE_URL ?? '');
    expect(url.hostname).toBe('127.0.0.1');
    expect(url.port).toBe('5434');
    expect(url.pathname).toBe('/homehub_test');
    const identity = await prisma.$queryRaw<Array<{ database: string; role: string }>>`
        SELECT current_database() AS database, current_user AS role
    `;
    expect(identity[0]).toEqual({ database: 'homehub_test', role: 'homehub_app' });
    expect(vi.isMockFunction(sendEmail)).toBe(true);
    databaseVerified = true;
});

beforeEach(() => {
    fixtureEmails = [];
    fixtureUserIds = [];
    mockedSendEmail.mockReset().mockResolvedValue(undefined);
});

afterEach(async () => {
    vi.restoreAllMocks();
    if (!databaseVerified) return;

    // Only delete this test's uniquely named fixtures. Never truncate tables or
    // alter setupState. Include emails so partially created fixtures are removed.
    await prisma.$transaction(async (tx) => {
        const users = await tx.user.findMany({
            where: { email: { in: fixtureEmails } }, select: { id: true },
        });
        const ids = [...fixtureUserIds, ...users.map((user) => user.id)];
        await tx.verification.deleteMany({
            where: { value: { in: ids }, identifier: { startsWith: 'reset-password:' } },
        });
        // Account and session rows cascade from the user deletion.
        await tx.user.deleteMany({ where: { email: { in: fixtureEmails } } });
    });
});

afterAll(async () => {
    await prisma.$disconnect();
});

async function createFixture(role: 'admin' | 'user' = 'admin') {
    if (!databaseVerified) throw new Error('Test database has not been verified');
    const email = `recovery-${randomUUID()}@example.com`;
    fixtureEmails.push(email);
    // Trusted server-side API call is only for seeding fixtures, not a public
    // registration request. The default Better Auth member role is "user".
    const { user } = await auth.api.createUser({
        body: { email, name: 'Recovery Test', password: originalPassword, role },
    });
    fixtureUserIds.push(user.id);
    return user;
}

async function requestRecovery(email: string) {
    return auth.api.requestPasswordReset({ body: { email, redirectTo }, asResponse: true });
}

async function getEmailedToken(email: string) {
    const response = await requestRecovery(email);
    expect(response.status).toBe(200);
    expect(mockedSendEmail).toHaveBeenCalledTimes(1);
    
    const message = mockedSendEmail.mock.calls[0]?.[0];
    expect(message?.to).toBe(email);
    expect(message?.subject).toBe('Reset your password');
    
    const link = message?.text.match(/https?:\/\/\S+/)?.[0];
    
    if (!link) throw new Error('Expected a reset link in the mocked email');
    
    const url = new URL(link);
    expect(url.origin).toBe('http://localhost:3000');
    expect(url.searchParams.get('callbackURL')).toBe(redirectTo);
    expect(url.pathname).toMatch(/^\/api\/auth\/reset-password\/[^/]+$/);
   
    return url.pathname.split('/').at(-1)!;
}

async function passwordHash(userId: string) {
    const account = await prisma.account.findFirstOrThrow({
        where: { userId, providerId: 'credential' }, select: { password: true },
    });
    expect(account.password).toBeTruthy();
    return account.password;
}

async function completeRecovery(token?: string, password = newPassword) {
    return auth.api.resetPassword({
        body: { newPassword: password, ...(token === undefined ? {} : { token }) },
        asResponse: true,
    });
}

async function expectDenied(result: Promise<Response>) {
    // Before-hook APIErrors reject direct server API calls even with asResponse.
    // The HTTP handler converts these errors into responses for browser clients.
    await expect(result).rejects.toMatchObject({
        statusCode: 400,
        body: { message: 'Invalid or expired recovery link.' },
    });
}

describe('admin-only password recovery', () => {
    it('emails an admin a link backed by an unexpired verification record', async () => {
        const user = await createFixture();
        const token = await getEmailedToken(user.email);
        const verification = await prisma.verification.findFirstOrThrow({
            where: { identifier: `reset-password:${token}` },
        });
        expect(verification.value).toBe(user.id);
        expect(verification.expiresAt.getTime()).toBeGreaterThan(Date.now());
    });

    it('returns the same status/body for admin, member, and unknown email; only emails the admin', async () => {
        const admin = await createFixture();
        const member = await createFixture('user');
        const responses = [];
        
        for (const email of [admin.email, member.email, `missing-${randomUUID()}@example.com`]) {
            const response = await requestRecovery(email);
            expect(response.status).toBe(200);
            responses.push(await response.json());
        
        }
        expect(responses[0]).toMatchObject({ status: true });
        expect(responses[1]).toEqual(responses[0]);
        expect(responses[2]).toEqual(responses[0]);
        expect(mockedSendEmail).toHaveBeenCalledTimes(1);
        expect(mockedSendEmail.mock.calls[0]?.[0].to).toBe(admin.email);
    });

    it.each([undefined, '', 'nonexistent-test-token'])(
        'rejects a missing, empty, or unknown token (%s) without changing a password',
        async (token) => {
            const user = await createFixture();
            const before = await passwordHash(user.id);
            await expectDenied(completeRecovery(token));
            expect(await passwordHash(user.id)).toBe(before);
            expect(mockedSendEmail).not.toHaveBeenCalled();
        },
    );

    it('rejects an expired admin token without changing the password', async () => {
        const user = await createFixture();
        const token = await getEmailedToken(user.email);
        const before = await passwordHash(user.id);
        await prisma.verification.updateMany({
            where: { identifier: `reset-password:${token}`, value: user.id },
            data: { expiresAt: new Date(Date.now() - 60_000) },
        });
        
        await expectDenied(completeRecovery(token));
        expect(await passwordHash(user.id)).toBe(before);
    });

    it('rejects a member-owned token even if someone obtains it from the DB', async () => {
        const member = await createFixture('user');
        const before = await passwordHash(member.id);
        expect((await requestRecovery(member.email)).status).toBe(200);
        expect(mockedSendEmail).not.toHaveBeenCalled();
        
        // Better Auth creates this record before the email callback filters roles.
        const verification = await prisma.verification.findFirstOrThrow({
            where: { value: member.id, identifier: { startsWith: 'reset-password:' } },
        });
        const token = verification.identifier.slice('reset-password:'.length);
        await expectDenied(completeRecovery(token));
        expect(await passwordHash(member.id)).toBe(before);
    });

    it('rejects a token when its admin has since been demoted', async () => {
        const user = await createFixture();
        const token = await getEmailedToken(user.email);
        const before = await passwordHash(user.id);
        await prisma.user.update({ where: { id: user.id }, data: { role: 'user' } });
        await expectDenied(completeRecovery(token));
        expect(await passwordHash(user.id)).toBe(before);
    });

    it('rejects a token whose account was deleted', async () => {
        const user = await createFixture();
        const token = await getEmailedToken(user.email);
        await prisma.user.delete({ where: { id: user.id } });
        await expectDenied(completeRecovery(token));
        expect(await prisma.user.findUnique({ where: { id: user.id } })).toBeNull();
    });

    it.each(['short', 'x'.repeat(129)])('rejects an out-of-policy new password (case %#)', async (password) => {
        const user = await createFixture();
        const token = await getEmailedToken(user.email);
        const before = await passwordHash(user.id);
        expect((await completeRecovery(token, password)).status).toBe(400);
        expect(await passwordHash(user.id)).toBe(before);
        // Bad password input must not use up an otherwise valid recovery token.
        expect(await prisma.verification.count({
            where: { identifier: `reset-password:${token}`, value: user.id },
        })).toBe(1);
    });

    it('resets once, rejects the old password, and invalidates existing admin sessions only', async () => {
        const user = await createFixture();
        const member = await createFixture('user');
        const before = await passwordHash(user.id);
        const login = async (email: string, password = originalPassword) => auth.api.signInEmail({
            body: { email, password }, asResponse: true,
        });
        const firstLogin = await login(user.email);
        expect(firstLogin.status).toBe(200);
        const cookies = firstLogin.headers.getSetCookie().map((cookie) => cookie.split(';')[0]).join('; ');
        expect(cookies).not.toBe('');
        const sessionHeaders = new Headers({ cookie: cookies });
        expect((await auth.api.getSession({ headers: sessionHeaders }))?.user.id).toBe(user.id);
        expect((await login(user.email)).status).toBe(200);
        expect((await login(member.email)).status).toBe(200);
        expect(await prisma.session.count({ where: { userId: user.id } })).toBe(2);

        const token = await getEmailedToken(user.email);
        const response = await completeRecovery(token);
        expect(response.status).toBe(200);
        expect(await response.json()).toMatchObject({ status: true });
        const changedHash = await passwordHash(user.id);
        expect(changedHash).not.toBe(before);
        expect(changedHash).not.toBe(newPassword);
        expect(await prisma.session.count({ where: { userId: user.id } })).toBe(0);
        expect(await prisma.session.count({ where: { userId: member.id } })).toBe(1);
        expect(await auth.api.getSession({ headers: sessionHeaders })).toBeNull();
        expect((await login(user.email)).status).toBe(401);
        expect((await login(user.email, newPassword)).status).toBe(200);

        await expectDenied(completeRecovery(token, 'Another-test-password-2026!'));
        expect(await passwordHash(user.id)).toBe(changedHash);
    });

    it('handles email delivery failure without exposing SMTP errors to the requester', async () => {
        const user = await createFixture();
        const log = vi.spyOn(console, 'error').mockImplementation(() => {});
        mockedSendEmail.mockRejectedValueOnce(new Error('Simulated SMTP failure (test only)'));
        const response = await requestRecovery(user.email);
        expect(response.status).toBe(200);
        expect(await response.json()).toMatchObject({ status: true });
        await vi.waitFor(() => expect(log).toHaveBeenCalledExactlyOnceWith('Password recovery email delivery failed'));
    });
});
