import { Currency, User } from 'lucide-react';
import { useState, useRef, use } from 'react';
import type { ComponentProps } from 'react';
import { createMember, listUsers, revokeUserSessions, removeUser, setUserPassword} from '../services/authService';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { UserCard } from '../components/layout/userCard';
import type { User as HomeHubUser } from '../types/domain';


export function CreateMemberPage() {
    const emailRef = useRef<HTMLInputElement>(null);
    const nameRef = useRef<HTMLInputElement>(null);
    const passwordRef = useRef<HTMLInputElement>(null);
    const confirmPasswordRef = useRef<HTMLInputElement>(null);
    const resetPasswordRef = useRef<HTMLInputElement>(null);
    const confirmResetPasswordRef = useRef<HTMLInputElement>(null);


    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [resetPassword, setResetPassword] = useState(false)

    const [resetTarget, setResetTarget] = useState<HomeHubUser | null>(null);

    const queryClient = useQueryClient();

    const {
        data: users = [],
        isPending: isLoadingUsers,
        error: usersError,
    } = useQuery({
        queryKey: ['admin-users'],
        queryFn: listUsers
    })

    const handleSubmit: ComponentProps<'form'>['onSubmit'] = async (event) => {
        event?.preventDefault();

        if (isSubmitting) return;

        const name = nameRef.current?.value;
        const email = emailRef.current?.value;
        const password = passwordRef.current?.value;
        const confirmPassword = confirmPasswordRef.current?.value;

        setErrorMessage('')
        setSuccessMessage('')

        if (!name || !email || !password) {
            setErrorMessage('Please complete all required fields.');
            return;
        }

        if(password != confirmPassword) {
            setErrorMessage('Passwords do not match')
            return
        }
        
        setIsSubmitting(true)

        try{
            await createMember(name, email?.trim(), password)

            setSuccessMessage('Member created successfuly.')

            await queryClient.invalidateQueries({
                queryKey: ['admin-users']
            })

            if (passwordRef.current !== null) {
              passwordRef.current.value = '';
            }
            
            if (confirmPasswordRef.current !== null) {
              confirmPasswordRef.current.value = '';
            }
        } catch (reason) {
            setErrorMessage(reason instanceof Error ? reason.message : 'Sign in failed')
        } finally {
            setIsSubmitting(false)
            
        }
    }

    async function handleRemoveUser(userId: string): Promise<void> {
        await removeUser(userId)
        await queryClient.invalidateQueries({
            queryKey: ['admin-users'],
        })
        setResetTarget((current) => 
          current?.id === userId? null : current
        )
    }

    const [isResetting, setIsResetting] = useState(false);
    const [resetError, setResetError] = useState('');
    const [resetSuccess, setResetSuccess] = useState('');

    // Comfirm that all feilds are fill and passwords match, then call Better Auth setUserPassword
    const handleResetPassword:  ComponentProps<'form'>['onSubmit'] = async (event) => {
      event?.preventDefault();

      if (isResetting || !resetTarget) return;

      const target = resetTarget
      const newPassword = resetPasswordRef.current?.value
      const comfirmation = confirmResetPasswordRef.current?.value

      setResetError('')
      setResetSuccess('')

      if (!target || !newPassword || !comfirmation) {
        setResetError('Please fill out all feilds')
        return;
      }
      if (newPassword !== comfirmation) {
        setResetError('Passwords do not match')
        return;
      }

      setIsResetting(true)

      let passwordChanged = false;

      try{
        await setUserPassword(target.id, newPassword);
        passwordChanged = true;

        if (resetPasswordRef.current) {
          resetPasswordRef.current.value = '';
        }
      
        if (confirmResetPasswordRef.current) {
          confirmResetPasswordRef.current.value = '';
        }

      await revokeUserSessions(target.id);

      await queryClient.invalidateQueries({
          queryKey: ['user-sessions', target.id],
      });

       setResetSuccess(
                `Password changed and existing sessions ended for ${target.email}.`,
            );
      } catch(error) {
        setResetError(
            passwordChanged
                ? 'The password changed, but session cleanup or refresh failed. Do not repeat the password reset; retry ending sessions.'
                : error instanceof Error
                    ? error.message
                    : 'Unable to reset password.',
        );
      } finally {
        setIsResetting(false);
      }
    }

    // This function only opens the reset form for the selected person. It makes no request, so it doesn’t need async.
    const handleSelectResetTarget = (user: HomeHubUser): void => {
        if (isResetting || isSubmitting) return;

        setResetError('');
        setResetSuccess('');
        setResetTarget(user);
    };

    return (
      <main className="login-page">
      {/* The story column explains product scope; none of its content submits or navigates. */}
      <section className="login-story">
        <div className="login-brand">
          <span className="brand-mark">
            <User />
          </span>
          <strong>Users</strong>
        </div>
        <div className='user-grid'>
            {isLoadingUsers ? (
                <p>Loading Users...</p>
            ) : usersError ? (
                <p role='alert'>Unable to load users.</p>
            ) : (
                users.map((user) => (
                    <UserCard key={user.id} user={user} onRevokeSessions={revokeUserSessions} onRemoveUser={handleRemoveUser} onResetPassword={handleSelectResetTarget}/>
                ))
            )}
        </div>
      </section>

      {}

      {/* The form column owns draft inputs and sends finished credentials to AuthProvider. */}
      <section className="login-panel" aria-labelledby="login-title">
            
        {resetTarget ? (
          <div className="login-card">
            <p className="eyebrow">Welcome Admin</p>
            <h2 id="login-title">Reset Pasword</h2>
            <p> For {resetTarget.displayName} ({resetTarget.email})</p>

            {/* This controlled form calls handleSubmit; the browser does not post directly to a URL. */}
            <form key={resetTarget.id} onSubmit={handleResetPassword}>
              <label htmlFor="password">Password</label>
              <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={10}
              maxLength={128}
              ref={resetPasswordRef}
              disabled={isResetting}
              required
              />
              <label htmlFor="confirm-password">Confirm Password</label>
              <input
                id="confirm-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                minLength={10}
                maxLength={128}
                ref={confirmResetPasswordRef}
                disabled={isResetting}
                required
              />
              <button className="button primary full-width" type='submit' disabled={isResetting}>
                {isResetting ? 'Resetting...' : 'Reset Password'}
              </button>

              <button className="button primary full-width" type="button" disabled={isResetting} onClick={() => setResetTarget(null)}>Cancel</button>
            
              {resetError && <p role="alert">{resetError}</p>}
              {resetSuccess && <p role="status">{resetSuccess}</p>}
            </form>
          </div>
        ) : (
        <div className="login-card">   
          <p className="eyebrow">Welcome Admin</p>
          <h2 id="login-title">Register User</h2>
          <p>Add your homemembers to enjoy HomeHub.</p>

          {/* This controlled form calls handleSubmit; the browser does not post directly to a URL. */}
          <form key='create-member' onSubmit={handleSubmit}>
            <label htmlFor="name">Name</label>
            <input 
              id="name" 
              name="name" 
              type="text" 
              autoComplete="name" 
              ref={nameRef}
              required
            />
            <label htmlFor="email">Email address</label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              ref={emailRef}
              required
            />
            <label htmlFor="password">Password</label>
            <input
            id="password"
            name="password"
            type="password"
            autoComplete="new-password"
            minLength={10}
            maxLength={128}
            ref={passwordRef}
            required
            />
            <label htmlFor="confirm-password">Confirm Password</label>
            <input
              id="confirm-password"
              name="confirm-password"
              type="password"
              autoComplete="new-password"
              minLength={10}
              maxLength={128}
              ref={confirmPasswordRef}
              required
            />
        
            <button className="button primary full-width" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Please Wait...' : 'Create User'}
            </button>
            
            {errorMessage && (
              <p role="alert" className="form-error">
                {errorMessage}
              </p>
            )}
            {successMessage && (
              <p role="status" className="form-error">
                {successMessage}
              </p>
            )}
          
          </form>
        </div>
        )} 
      </section>
    </main>
    );
}

