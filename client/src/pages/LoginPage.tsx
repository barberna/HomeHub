/** LoginPage owns form drafts; AuthProvider owns the session created after a successful sign-in. */
import { Home, LockKeyhole } from 'lucide-react';
import { useState, useRef } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { routes } from '../config/appConfig';
import { useAuth } from '../context/useAuth';
import type { ComponentProps } from 'react';
import { requestPasswordRecovery } from '../services/authService';

export function LoginPage() {
  
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);


  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const resetPasswordEmailRef = useRef<HTMLInputElement>(null)
  const [resetPassword, setResetPassword] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [resetError, setResetError] = useState('');
  const [resetSuccess, setResetSuccess] = useState('');

  
  const { signIn, isAuthenticated } = useAuth();
  
  const navigate = useNavigate();
  
  
  if (isAuthenticated) return <Navigate to={routes.dashboard} replace />;
  
  /*
  const handleSubmit — creates your function variable.
  ComponentProps<'form'> — gets the TypeScript types for all props accepted by a React <form>.
  ['onSubmit'] — selects just the type of its onSubmit prop.
  async (event) => { ... } — defines the actual function. TypeScript now knows what kind of event it receives.
  */
  const handleSubmit: ComponentProps<'form'>['onSubmit'] = async (event) => {
    event.preventDefault();
    
    setSuccessMessage('');
    setErrorMessage('');

    const email = emailRef.current?.value
    const password = passwordRef.current?.value
    
    if (!email || !password) {
      setErrorMessage('Enter both an email address and password.');
      return;
    }

    setIsSubmitting(true);

    try {
  
      await signIn(email.trim(), password)

      // Navigation
      navigate(routes.dashboard, { replace: true })

      
    } catch (reason) {
      setErrorMessage(reason instanceof Error ? reason.message : 'Sign in failed.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Comfirm that all feilds are fill and passwords match, then call Better Auth setUserPassword
      const handleResetPassword:  ComponentProps<'form'>['onSubmit'] = async (event) => {
        event?.preventDefault();
  
        if (isResetting || !resetPassword) return;

        const email = resetPasswordEmailRef.current?.value.trim()

        setResetError('')
        setResetSuccess('')


        if (!email) {
          setResetError('Please enter email')
          return;
        }

        setIsResetting(true)

        try{

          await requestPasswordRecovery(email)

          setResetSuccess('If this account is eligible, check your email for a recovery link.')

          if (resetPasswordEmailRef.current) {
            resetPasswordEmailRef.current.value = '';
          }

        } catch(error) {
            setResetError(
              error instanceof Error
                ? error.message
                : 'Unable to request a recovey link.'
            )
        } finally {
          setIsResetting(false)
        }
      }

  return (
    <main className="login-page">
      {/* The story column explains product scope; none of its content submits or navigates. */}
      <section className="login-story">
        <div className="login-brand">
          <span className="brand-mark">
            <Home />
          </span>
          <strong>HomeHub</strong>
        </div>
        <div>
          <p className="eyebrow">One calm place for home technology</p>
          <h1>Your household services, together.</h1>
          <p>
            HomeHub is a private-home-network dashboard for cloud storage, a future local AI
            assistant, shared tasks, and server health.
          </p>
        </div>
        <div className="privacy-note">
          <LockKeyhole aria-hidden="true" />
          <div>
            <strong>Protected Access</strong>
            <p>Sign in to access your HomeHub dashboard and services.</p>
          </div>
        </div>
      </section>

      {/* The form column owns draft inputs and sends finished credentials to AuthProvider. */}
      <section className="login-panel" aria-labelledby="login-title">

        {resetPassword ? (

          <div className="login-card">
          <p className="eyebrow">HomeHub</p>
          <h2 id="login-title">Reset Password</h2>
          <p>Enter your administrator email to request a recovery link.
            Members should contact their administrator for password help.</p>

          {/* This controlled form calls handleSubmit; the browser does not post directly to a URL. */}
          <form onSubmit={handleResetPassword}>
            <label htmlFor="recovery-email">Email address</label>
            <input
              id="recovery-email"
              name="email"
              type="email"
              autoComplete="email"
              ref={resetPasswordEmailRef}
              required
            />
          
            {resetError && (
              <p role="alert" className="form-error">
                {resetError}
              </p>
            )}

            {resetSuccess && (
              <p role="status">
                {resetSuccess}
              </p>
            )}
           
            <button className="button primary full-width" disabled={isResetting}>
              {isResetting ? 'Sending...' : 'Send Recovery Link'}
            </button>

            <button type="button" onClick={() => {
              setResetPassword(false);
              setResetError('');
              setResetSuccess('');
            }} className='button primary full-width' disabled={isResetting}>Back to Login</button>
          
          </form>
        </div>

        ): (
          <div className="login-card">
          <p className="eyebrow">Welcome home</p>
          <h2 id="login-title">Sign in to HomeHub</h2>
          <p>Enter your login credentials to enjoy HomeHub.</p>

          {/* This controlled form calls handleSubmit; the browser does not post directly to a URL. */}
          <form onSubmit={handleSubmit}>
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
            <div className="password-field">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                minLength={10}
                maxLength={128}
                ref={passwordRef}
                required
              />

              <button className='forgot-password-button' type='button' onClick={() => setResetPassword(true)}>Forgot Password</button>
            </div>
            
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
           
            <button className="button primary full-width" disabled={isSubmitting}>
              {isSubmitting ? 'Signing in…' : 'Sign in'}
            </button>
          
          </form>
        </div>
        )}
      </section>
    </main>
  );
}
