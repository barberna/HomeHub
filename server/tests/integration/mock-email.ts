import { vi } from 'vitest';

// Mock the entire module before auth.ts loads it. No SMTP credentials,
// transporter, network connection, or real email delivery in integration tests.
vi.mock('../../src/lib/email.js', () => ({
    sendEmail: vi.fn().mockResolvedValue(undefined),
    verifyEmailConnection: vi.fn().mockResolvedValue(undefined),
}));
