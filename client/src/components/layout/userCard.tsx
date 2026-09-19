import { authClient } from '../../lib/auth-client';
import type { User } from '../../types/domain';
import { useRef, useState } from 'react';
import { Loader, ShieldCheck, Trash } from 'lucide-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getLastSession } from '../../services/authService';

interface UserCardProps {
  user: User;
  onRevokeSessions: (userId: string) => Promise<void>;
  onRemoveUser: (userId: string) => Promise<void>;
  onResetPassword: (user: User) => void;
}


/* Shows the current user and sign-out button in the sidebar. */
export function UserCard({ user, onRevokeSessions, onRemoveUser, onResetPassword }: UserCardProps) {

    const [logoutError, setLogoutError] = useState('');
    const [isLoggingOut, setIsLoggingOut] = useState(false);

    const [removeError, setRemoveError] = useState('');
    const [isRemoving, setIsRemoving] = useState(false);

    const [isOpening, setIsOpening] = useState(false)

    const queryClient = useQueryClient();



    // 
    const {
        data: lastSession,
        isPending: isLoading,
        error: sessionError,
    } = useQuery ({
        queryKey: ['user-sessions', user.id],
        queryFn: () => getLastSession(user.id)
    })

    // supplies the logged-in identity to your AuthProvider
    const {
        data: currentSession,
        refetch: refreshCurrentSession,
    } = authClient.useSession();

    // We do not want to just call logout() this logsout admin, we want to end user sessions
    async function handleLogout() {
        if (isLoggingOut) return;

        setIsLoggingOut(true);

        // We the remove the session from the user, if the user is my current session, refresh the session, this terminiates the session wothout paeg reload.
        try {
            const isOwnAccount = currentSession?.user.id === user.id;

            await onRevokeSessions(user.id);

            if (isOwnAccount) {
                await refreshCurrentSession();
            } else {
                await queryClient.invalidateQueries({
                    queryKey: ['user-sessions', user.id],
                })
            }
        } catch {
            setLogoutError('Logout failed. Please try again.');
        } finally {
            setIsLoggingOut(false);
        }
    }

    // When delete user is pressed we need to get confirmation first
    async function handleDelete() {
        if (isRemoving || isLoggingOut) return;

        const confirmed = window.confirm(
            `Permanently delete ${user.displayName} (${user.email})? This cannot be undone.`,
        );

        if (!confirmed) { return; }
        
        setIsRemoving(true);
        setRemoveError('');

        try {
            await onRemoveUser(user.id);
        } catch {
            setRemoveError('Unable to remove User');
        } finally {
            setIsRemoving(false)
        }
    }

  
  return (
    <div className="panel profile-card">
        <div className='user-data'>
            <span className="avatar" aria-hidden="true">
                {user?.displayName.charAt(0)}
            </span>

            <div className='user-profile-name'>
                <strong>{user?.displayName}</strong>
                <span className="role-badge">
                    <ShieldCheck size={15} />
                    {user?.role === 'admin' ? 'Administrator' : 'Member'}
                </span>

                { user.role === 'user' && (
                    <button className='icon-button-reset' disabled={isOpening} onClick={() => onResetPassword(user)}>
                        {isOpening ? 'Opening...' : 'Reset Password'}
                    </button>
                )}

                
            </div>
            
        </div>
        <div>
            <strong>Active Session</strong>
            <p>
                {isLoading
                    ? 'Loading…'
                    : sessionError
                        ? 'Unable to load user sessions.'
                        : lastSession
                            ? lastSession.toLocaleString()
                            : 'No session found'}
            </p>
        </div>
        
        <div className='button-stack'>
            
            <button className="icon-button-userCard" onClick={handleLogout} aria-label="Sign out" disabled={isLoggingOut || isRemoving}>
                {isLoggingOut ? 'Logging out...' : 'Logout'}
            </button>

            {user?.role === 'user' ? <button className="icon-button" onClick={handleDelete} disabled={isRemoving} aria-label="Delete" >
                                            {isRemoving ? <Loader/> : <Trash/>}
                                    </button>
                                    : null
            }

            {logoutError && <p role='alert'>{logoutError}</p>}
            {removeError && <p role='alert'>{removeError}</p>}
        </div>
    </div>
  );
}
