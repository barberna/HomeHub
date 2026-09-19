/** AuthContext exposes one mock session to every route without prop drilling. */
import { ReactNode } from 'react';
import { authClient } from '../lib/auth-client';
import * as authService from '../services/authService';
import type { User } from '../types/domain';
import { AuthContext, type AuthContextValue } from './useAuth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, isPending, error, refetch } = authClient.useSession();

  if (isPending) {
    return <p role="status">Checking your session...</p>;
  }

  if (error) {
    return (
      <div role="alert">
        <p>Unable to check your session. Please try again.</p>
        <button type="button" onClick={() => void refetch()}>
          Retry
        </button>
      </div>
    );
  }

  const sessionUser = session?.user;

  // The User | null annotation means user can contain either a HomeHub user or no user
  let user: User | null = null;

  if (sessionUser) {
    const role =
      'role' in sessionUser && typeof sessionUser.role === 'string' ? sessionUser.role : 'user';

    user = {
      id: sessionUser.id,
      displayName: sessionUser.name,
      email: sessionUser.email,
      role: role.split(',').includes('admin') ? 'admin' : 'user',
    };
  }

  const value: AuthContextValue = {
    user,
    isAuthenticated: user !== null,

    // signIn() calls your service in authService, then refreshes the session.
    async signIn(email: string, password: string) {
      const signedInUser = await authService.login(email, password);
      await refetch();
      return signedInUser;
    },

    // signOut() calls calls better auth logout service and performs appropriate session handling
    async signOut() {
      await authService.logout();
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
