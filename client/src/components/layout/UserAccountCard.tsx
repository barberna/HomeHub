import type { User } from '../../types/domain';
import { useState } from 'react';

/*
This tells TypeScript the component receives:
- user: the current user, or null.
- onSignOut: a function it calls when the logout button is clicked.
*/
interface UserAccountCardProps {
  user: User | null;
  onSignOut: () => Promise<void>;
}

/* Shows the current user and sign-out button in the sidebar. */
export function UserAccountCard({ user, onSignOut }: UserAccountCardProps) {;

  const [logoutError, setLogoutError] = useState('');
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    if (isLoggingOut) return;

    setLogoutError('');
    setIsLoggingOut(true);

    try {
        await onSignOut();
    } catch {
        setLogoutError('Logout failed. Please try again.');
    } finally {
        setIsLoggingOut(false);
    }
  }

  return (
    <div className="account-card">
      {/* Identity and role originate in AuthContext and arrive here through AppShell props. */}
      <span className="avatar" aria-hidden="true">
        {user?.displayName.charAt(0)}
      </span>

      <div>
        <strong>{user?.displayName}</strong>
        <span>{user?.role === 'admin' ? 'Administrator' : 'Household member'}</span>
      </div>

      {/* The callback is owned by AppShell because it also performs the login-route redirect. */}
      <button className="icon-button" onClick={handleLogout} aria-label="Sign out" disabled={isLoggingOut}>
        {isLoggingOut ? 'Logging out...' : 'Logout'}
      </button>

      {logoutError && <p role='alert'>{logoutError}</p>}
      
    </div>
  );
}
