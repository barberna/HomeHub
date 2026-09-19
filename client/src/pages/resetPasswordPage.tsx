import { useState, useRef, use, ComponentProps } from 'react';
import { resetPassword } from '../services/authService.js';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { routes } from '../config/appConfig';

export function ResetPasswordPage() {

    const resetPasswordRef = useRef<HTMLInputElement>(null);
    const confirmResetPasswordRef = useRef<HTMLInputElement>(null);

    const [isResetting, setIsResetting] = useState(false);
    const [resetError, setResetError] = useState('');
    const [resetSuccess, setResetSuccess] = useState('');

    const navigate = useNavigate()

    const location = useLocation();

    const searchParams = new URLSearchParams(location.search);
    const token = searchParams.get('token');

    // Check if user has token before even letting them enter a password.
    const hasInvalidLink =
    !token?.trim() || searchParams.has('error');

    const handleResetAdmin: ComponentProps<'form'>['onSubmit'] = async (event) => {
        event?.preventDefault();

        // If already submitted, has no toekn or invaid link return. 
        // If if someone eners page route, they wont be able to use the reset form
        if (isResetting || hasInvalidLink || !token) return;

        setResetError('');
        setResetSuccess('');

        const password = resetPasswordRef.current?.value
        const confirm = confirmResetPasswordRef.current?.value

        if (!password || !confirm) {
            setResetError('Please enter password and confirmation')
            return;
        }
        if (password !== confirm) {
            setResetError('Passwords do not match')
            return;
        }

        setIsResetting(true)

        try{

            await resetPassword(password, token)

            if (resetPasswordRef.current) {
                resetPasswordRef.current.value = ''
            }
            if(confirmResetPasswordRef.current) {
                confirmResetPasswordRef.current.value = ''
            }

            navigate(routes.login, { replace: true })

        } catch(error) {
            setResetError(
                error instanceof Error
                    ? error.message
                    : 'Unable to reset password'
            );
        } finally {
            setIsResetting(false);
        }
    }

    return (
        <section className="login-panel" aria-labelledby="login-title">
          <div className="login-card">
            <p className="eyebrow">Welcome Admin</p>
            <h2 id="login-title">Reset Pasword</h2>

            {hasInvalidLink && (
            <p role="alert" className="form-error">
                This recovery link is invalid or expired.
                Return to login to request a new link.
            </p>
            )}

            {/* This controlled form calls handleSubmit; the browser does not post directly to a URL. */}
            <form onSubmit={handleResetAdmin}>
              <label htmlFor="reset-password">Password</label>
              <input
              id="reset-password"
              name="password"
              type="password"
              autoComplete="new-password"
              minLength={10}
              maxLength={128}
              ref={resetPasswordRef}
              disabled={isResetting || hasInvalidLink}
              required
              />
              <label htmlFor="confirm-reset-password">Confirm Password</label>
              <input
                id="confirm-reset-password"
                name="confirm-password"
                type="password"
                autoComplete="new-password"
                minLength={10}
                maxLength={128}
                ref={confirmResetPasswordRef}
                disabled={isResetting || hasInvalidLink}
                required
              />
              <button className="button primary full-width" type='submit' disabled={isResetting || hasInvalidLink}>
                {isResetting ? 'Resetting...' : 'Reset Password'}
              </button>

                <button
                    type="button"
                    className="button full-width"
                    disabled={isResetting}
                    onClick={() => {
                        setResetError('');
                        setResetSuccess('');
                        navigate(routes.login, { replace: true });
                    }}
                    >
                    Cancel
                </button>

            
              {resetError && <p role="alert">{resetError}</p>}
              {resetSuccess && <p role="status">{resetSuccess}</p>}
            </form>
          </div>
      </section>
    )
}