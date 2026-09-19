import type { User } from '../types/domain';
import { authClient } from '../lib/auth-client';

// authService.ts: login, logout, and password recovery.

export async function login(email: string, password: string): Promise<User> {
  const { data, error } = await authClient.signIn.email({
    email,
    password,
  });

  if (error) {
    throw new Error(error.message || 'Sign in failed.');
  }

  if (!data.user) {
    throw new Error('The server did not return a user.');
  }

  // Read the role if it is included in the server response.
  const role = 'role' in data.user && typeof data.user.role === 'string' ? data.user.role : 'user';

  return {
    id: data.user.id,
    displayName: data.user.name,
    email: data.user.email,
    role: role.split(',').includes('admin') ? 'admin' : 'user',
  };
}

export async function logout(): Promise<void> {
  const { error } = await authClient.signOut();

  if (error) {
    throw new Error(error.message || 'Sign out failed.');
  }
}


export async function createMember(name: string, email: string, password: string):
 Promise<void> {
  const { data, error } = await authClient.admin.createUser({
    email: email, // required, The email of the user.
    password: password, // required, The password of the user.
    name: name, // required, The name of the user.
    role: 'user',
  });

  if (error) {
    throw new Error(error.message || 'Registration failed.');
  }

  if (!data.user) {
    throw new Error('The server did not return a user.');
  }
}


export async function listUsers(): Promise<User[]> {
  const { data, error } = await authClient.admin.listUsers({
    query: {}
  })

  if (error) {
    throw new Error(error.message || 'User Query Failed')
  }

  if (!data) {
    throw new Error('The server did not return users')
  }
  
  /*
  Here’s what that does:
  - data.users is Better Auth’s returned array.
  - .map() creates a new array by converting each user.
  - displayName: user.name matches your app’s naming.
  - The role expression checks whether the returned roles include 'admin'; otherwise, it uses 'user'.
  - : User asks TypeScript to check that each converted object matches your app’s User type.
  */

  return data.users.map((user): User => ({
    id: user.id,
    displayName: user.name,
    email: user.email,
    role: user.role?.split(',').includes('admin') ? 'admin' : 'user',
  }));

}

export async function revokeUserSessions(userId: string): Promise<void> {
    const { error } = await authClient.admin.revokeUserSessions({
        userId,
    });

    if (error) {
        throw new Error(error.message || 'Unable to end user sessions.');
    }
}


export async function removeUser(userId: string): Promise<void> {
  const { error } = await authClient.admin.removeUser({
    userId: userId
  });

   if (error) {
        throw new Error(error.message || 'Unable to remove user.');
    }
}

export async function getLastSession(userId: string): Promise<Date | null> {
   const { data, error } = await authClient.admin.listUserSessions({
          userId: userId
      })

      if (error) {
          throw new Error(error.message || 'Unable to load user sessions.')
      }

      if (!data) {
          throw new Error('The server did not return session data.');
      }

      // [...data.sessions] copies the session array so sorting doesn’t modify the original.
      // .sort(...) orders sessions newest first. getTime() converts dates into numbers so you can subtract them.
      // [0] selects the first—and therefore newest—session. An empty array gives undefined.
      // newestSession ? ... : null saves its creation date, or null if there are no sessions.
      // if (!ignore) updates state only if this effect hasn’t been cleaned up—for example, because the card disappeared or changed users.
      const newestSession = [...data.sessions].sort(
          (a,b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0];

    return newestSession
      ? new Date(newestSession.createdAt)
      : null;
}

export async function setUserPassword(userId: string, newPassword: string): Promise<void> {
  const { data, error } = await authClient.admin.setUserPassword({
    newPassword: newPassword,
    userId: userId
  })

  if (error) {
        throw new Error(error.message || 'Unable to reset user password')
    }

  if (!data) {
      throw new Error('The server did not return session data.');
  }
}

export async function requestPasswordRecovery(email: string): Promise<void> {
  const { error } = await authClient.requestPasswordReset({
    email,
    redirectTo: new URL('/reset-password', window.location.origin).href,
  })

  if(error) {
    throw new Error(
      error.status === 429
      ? 'Too many attempts. Please try again later.'
      : 'Unable to request a recovery link. Please try again.',
    );
  }
}

export async function resetPassword(newPassword: string, token: string) {
  const { error } = await authClient.resetPassword({
    newPassword: newPassword,
    token: token,
  });

  if (error) {
    throw new Error(
      error.message || 'Unable to reset password'
    )
  }
}
