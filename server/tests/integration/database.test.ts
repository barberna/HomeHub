import { afterAll, expect, it } from 'vitest';
import { prisma } from '../../src/lib/prisma.js';

afterAll(async () => {
    await prisma.$disconnect();
});

it('connects to the isolated test database as homehub_app', async () => {
    expect(process.env.HOMEHUB_INTEGRATION_TEST).toBe('1');

    const url = new URL(process.env.DATABASE_URL ?? '');

    expect(url.hostname).toBe('127.0.0.1');
    expect(url.port).toBe('5434');
    expect(url.pathname).toBe('/homehub_test');

    const rows = await prisma.$queryRaw<
        Array<{ database: string; role: string }>
    >`
        SELECT current_database() AS database,
               current_user AS role
    `;

    expect(rows[0]).toEqual({
        database: 'homehub_test',
        role: 'homehub_app',
    });

    const setupState = await prisma.setupState.findUnique({
        where: { id: 1 },
    });

    expect(setupState).not.toBeNull();
});