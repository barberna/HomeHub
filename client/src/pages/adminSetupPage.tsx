import { Home, LockKeyhole } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type { ComponentProps } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { routes } from '../config/appConfig';


export function AdminLoginPage() {
  const emailRef = useRef<HTMLInputElement>(null);
  const nameRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);
  const setupSecretRef = useRef<HTMLInputElement>(null);

  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const navigate = useNavigate();

  const [ setupStatus, setSetupStatus ] = useState<'checking' | 'available' | 'unavailable' | 'error'>('checking')

  // Check the current setup staus to ensure we dont show the Admin setup if already created
  useEffect(() => {
    // bortController lets us cancel an outdated request
    const controller = new AbortController()

    async function checkSetup() {
      try {

        const response = await fetch('/api/setup/status', {
          cache: 'no-store',
          // Connect controller to request
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error('Setup check failed')
        }

        const result = await response.json()

        if (result.ok !== true || typeof result.data?.setupAvailable !== 'boolean') {
          throw new Error('Invalid setup response');
        }

        if (!controller.signal.aborted) {
          setSetupStatus(
            result.data.setupAvailable ? 'available' : 'unavailable'
          );
        }
      } catch {
        if (!controller.signal.aborted) {
          setSetupStatus('error');
        }
      }
    }

    // This calls the function. void explicitly discards its returned Promise; it doesn’t cancel it or catch errors. The function’s own try/catch handles failures.
    void checkSetup();

    // controller.abort() can cancel the browser’s fetch operation. This is useful if the user leaves the page before it finishes. It doesn’t guarantee the server never received the request
    return () => controller.abort();
  }, []);

  /*
  const handleSubmit — creates your function variable.
  ComponentProps<'form'> — gets the TypeScript types for all props accepted by a React <form>.
  ['onSubmit'] — selects just the type of its onSubmit prop.
  async (event) => { ... } — defines the actual function. TypeScript now knows what kind of event it receives.
  */
  const handleSubmit: ComponentProps<'form'>['onSubmit'] = async (event) => {
    event?.preventDefault();

    if (isSubmitting) return;

    const name = nameRef.current?.value;
    const email = emailRef.current?.value;
    const password = passwordRef.current?.value;
    const confirmPassword = confirmPasswordRef.current?.value;
    const setupSecret = setupSecretRef.current?.value;

    setErrorMessage('');
    setSuccessMessage('');

    

    if (password != confirmPassword) {
      setErrorMessage('Passwords do not match');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch('/api/setup/complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-CSRF-Protection': '1',
        },
        body: JSON.stringify({
          name,
          email,
          password,
          setupSecret
        }),
      });

      // This reads the response body and converts its JSON into a JavaScript object
      const result = await response.json();

      // If error display the error else default response
      if (!response.ok) {

        if (passwordRef.current !== null) {
           passwordRef.current.value = '';
        }

        if (confirmPasswordRef.current !== null) {
          confirmPasswordRef.current.value = '';
        }

        if (setupSecretRef.current !== null) {
          setupSecretRef.current.value = '';
        }

        setErrorMessage(result.error?.message ?? 'The request could not be completed.');

        return;
      }

      if (passwordRef.current !== null) {
           passwordRef.current.value = '';
      }
      
      if (confirmPasswordRef.current !== null) {
        confirmPasswordRef.current.value = '';
      }

      if (setupSecretRef.current !== null) {
        setupSecretRef.current.value = '';
      }

      navigate(routes.login, { replace: true })

    } catch {
      setErrorMessage('The server could not be reached. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  }

  // The page is loaded base on the use Effect
  if (setupStatus === 'checking') {
      return <p role="status">Checking setup availability…</p>;
  }

  if (setupStatus === 'unavailable') {
      return <Navigate to={routes.login} replace />;
  }

  if (setupStatus === 'error') {
      return (
          <p role="alert">
              Unable to check setup availability. Please reload to try again.
          </p>
      );
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
        </div>
        <div className="privacy-note">
          <LockKeyhole aria-hidden="true" />
          <div>
            <strong>Admin Setup</strong>
            <p>Home Hub Admin will be created here</p>
          </div>
        </div>
      </section>

      {/* The form column owns draft inputs and sends finished credentials to AuthProvider. */}
      <section className="login-panel" aria-labelledby="login-title">
        <div className="login-card">
          <p className="eyebrow">Admin Setup</p>
          <h2 id="login-title">Create Admin Account</h2>

          {/* This controlled form calls handleSubmit; the browser does not post directly to a URL. */}
          <form onSubmit={handleSubmit}>
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
              autoComplete="username"
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
            <label htmlFor='setup-secret'>Setup Secret</label>
            <input
            id="setup-secret"
            name="session-secret"
            type="password"
            autoComplete="off"
            spellCheck={false}
            minLength={43}
            maxLength={43}
            ref={setupSecretRef}
            required
            />
            

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

            <button className="button primary full-width" type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Please Wait...' : 'Create Admin'}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
