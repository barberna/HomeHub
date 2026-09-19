import type { PrismaClient } from '../generated/prisma/client.js';
import type { SetupInput } from './setup-input.js';
import { createAuth } from '../lib/auth.js';
import { InvalidAdminSetupError } from './setup-errors.js';

// We want to parse the input
//

async function adminSetup(database: PrismaClient, input: SetupInput) {
  const setupSecret = process.env.SETUP_SECRET;

  if (!setupSecret) {
    throw new Error('Initial setup is disabled');
  }

  if (input.setupSecret !== setupSecret) {
    throw new InvalidAdminSetupError();
  }

  return database.$transaction(async (tx) => {
    // Lock the existing setup-state row until this transaction ends.
    await tx.$queryRaw`
            SELECT "id"
            FROM public."setupState"
            WHERE "id" = 1
            FOR UPDATE
        `;

    //
    const setupState = await tx.setupState.findUnique({
      where: {
        id: 1,
      },
    });

    if (!setupState || setupState.completedAt !== null) {
      throw new InvalidAdminSetupError();
    }

    // Check if there are any user with the admins id
    const existingUser = await tx.user.findFirst({
      select: { id: true },
    });

    if (existingUser) {
      throw new InvalidAdminSetupError();
    }

    // Better Auth handles creating the user, hashing the password, and creating its credential account. Its admin plugin provides this server-side AP
    const setupAuth = createAuth(tx);

    const { user: adminUser } = await setupAuth.api.createUser({
      body: {
        name: input.name,
        email: input.email,
        password: input.password,
        role: 'admin',
      },
    });

    // Add a row tp setupState. This means that we have our one time admin creation
    await tx.setupState.update({
      where: { id: 1 },
      data: { completedAt: new Date() },
    });

    return { userId: adminUser.id };
  });
}

async function checkStatus(database: PrismaClient) {
  if (!process.env.SETUP_SECRET) {
    return { setupAvailable: false };
  }

  const setupState = await database.setupState.findUnique({
    where: {
      id: 1,
    },
  });

  if (!setupState || setupState.completedAt !== null) {
    return { setupAvailable: false };
  }

  // Check if there are any user with the admins id
  const existingUser = await database.user.findFirst({
    select: { id: true },
  });

  return { setupAvailable: existingUser === null };
}

export { adminSetup, checkStatus };
