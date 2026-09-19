import { betterAuth } from 'better-auth';
import { prismaAdapter } from 'better-auth/adapters/prisma';
import { admin } from 'better-auth/plugins';
import { prisma } from './prisma.js';
import type { Prisma, PrismaClient } from '../generated/prisma/client.js';
import { sendEmail } from "./email.js"; // your email sending function
import { createAuthMiddleware, APIError } from 'better-auth/api';

/*
During setup:
1. auth.ts configures Better Auth’s features, such as email/password login and the admin plugin.
2. The Better Auth CLI reads that configuration and generates the required models in schema.prisma.
3. schema.prisma describes your database tables, fields, and relationships.
4. Prisma’s migration commands turn schema changes into SQL migrations and apply them to PostgreSQL running in your container.
*/

// The Admin plugin provides a set of administrative functions for user management in your application.
// It allows administrators to perform various operations such as creating users, managing user roles, banning/unbanning users, impersonating users, and more.

// After this file is made run: npx auth@latest generate --config src/lib/auth.ts
// This should add models such as users, accounts, sessions, and verification records to: [server/prisma/schema.prisma]

// This creates and exports your configured authentication instance. Express can later use it to handle authentication requests.
export function createAuth(database: PrismaClient | Prisma.TransactionClient) {
  return betterAuth({
    appName: 'HomeHub',

    // This tells Better Auth to perform its database operations through your Prisma client, using PostgreSQL.
    database: prismaAdapter(database, {
      provider: 'postgresql',
      transaction: false,
    }),

    /*
    What this does
    1. Checks the endpoint: other operations, including your admin’s member-password reset, aren’t affected.
    2. Reads the recovery token: the user doesn’t need an existing session.
    3. Looks up its verification record: in your installed Better Auth version, that record’s value identifies the account.
    4. Checks its current role: a member—or someone demoted since receiving the email—is rejected.
    5. Allows Better Auth to continue: it handles password validation, consuming the token, hashing, and session revocation.
    The lookup does not consume the token; Better Auth still performs that step itself. Before hooks run before the endpoint’s opera
    */
    // ctx stand for context
    hooks: {
      before: createAuthMiddleware(async (ctx) => {
        // ctx.path is the better auth endpoint
        // if a request is not completing password recovery, then skid custom checks
        if (ctx.path !== '/reset-password') return;
        
        // ctx.body is the data submitted in the request body. Token and new password
        // ctx query URL query parameters
        const token = ctx.body?.token || ctx.query?.token;

        // If not a valid token then throw
        if (typeof token !== 'string' || token.length === 0) {
          throw new APIError('BAD_REQUEST', {
            message: 'Invalid or expired recovery link.',
          });
        }

        // ctx.context.internalAdapter: Better Auth’s internal database helpers, which you use to look up the recovery token.
        const verification = await ctx.context.internalAdapter.findVerificationValue(
          `reset-password:${token}`,
        );

        // If there is not a token, or it has expired, throw
        if (!verification || verification.expiresAt <= new Date()) {
          throw new APIError('BAD_REQUEST', {
            message: 'Invalid or expired recovery link.',
          });
        }

        // Role Checks. We want only admin verfications to work.
        const account = await database.user.findUnique({
          where: { id: verification.value },
          select: { role: true }
        });

        const isAdmin = account?.role?.split(',').includes('admin') === true;

        if (!isAdmin) {
          throw new APIError("BAD_REQUEST", {
            message: 'Invalid or expired recovery link.'
          });
        }

      })
    },

    // This enables email/password registration and login.
    // Better Auth supplies the password and session handling behind those flows. You still need to mount its handler in Express and connect your forms.
    emailAndPassword: {
      enabled: true,
      minPasswordLength: 10,
      maxPasswordLength: 128,
      revokeSessionsOnPasswordReset: true,
      disableSignUp: true,
      sendResetPassword: async ({user, url, token}, request) => {

        const account = await database.user.findUnique({
          where: { id: user.id },
          select: { role: true },
        });

        const isAdmin = account?.role?.split(',').includes('admin') === true;

        if (!isAdmin) {
          return;
        }

        void sendEmail({
          to: user.email,
          subject: "Reset your password",
          text: `Click the link to reset your password: ${url}`,
        }).catch(() => {
          console.error('Password recovery email delivery failed')
        })
      },
    },

    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
      cookieCache: {
        enabled: false,
      },
    },

    rateLimit: {
      enabled: true,
      storage: 'database',
    },

    // This adds your frontend’s origin—for example, http://localhost:5173—to Better Auth’s trusted origins for its security checks.
    // Better Auth also trusts its configured base URL.
    trustedOrigins: [process.env.CLIENT_ORIGIN!],

    // This enables admin operations, including listing users and managing their sessions. It does not automatically make your account an administrator;
    plugins: [admin()],
  });
}

export const auth = createAuth(prisma);
