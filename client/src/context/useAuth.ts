import { createContext, useContext } from 'react';
import type { User } from '../types/domain';

export interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<User>;
  signOut: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextValue | null>(null);
/**
 * useContext reads the nearest AuthProvider, giving nested routes one session without passing it
 * through every intermediate component as a prop.
 */
export function useAuth(): AuthContextValue {
  const value = useContext(AuthContext);
  if (!value) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }
  return value;
}
