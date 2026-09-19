/** Friendly system pages provide clear paths back into the authenticated application. */
import { ArrowLeft, Home, LockKeyhole, SearchX } from 'lucide-react';
import { Link } from 'react-router-dom';
import { routes } from '../../config/appConfig';
export function ForbiddenPage() {
  return (
    <main className="system-page">
      {/* AdminRoute renders this page when a signed-in non-admin enters an admin URL directly. */}
      <span className="system-icon">
        <LockKeyhole />
      </span>
      <p className="eyebrow">403 · Role protected</p>
      <h1>This area is for administrators.</h1>
      <p>
        Your account does not have permission to access this page.
      </p>

      {/* React Router changes the URL to `/dashboard` without reloading the SPA. */}
      <Link className="button primary" to={routes.dashboard}>
        <ArrowLeft size={17} /> Back to dashboard
      </Link>
    </main>
  );
}
export function NotFoundPage() {
  return (
    <main className="system-page">
      {/* App.tsx's wildcard route renders this page for any unknown authenticated URL. */}
      <span className="system-icon">
        <SearchX />
      </span>
      <p className="eyebrow">404 · Not found</p>
      <h1>That room is not in HomeHub.</h1>
      <p>The address may be incorrect, or the page may have moved.</p>

      {/* This link uses the same centralized dashboard path as the rest of the application. */}
      <Link className="button primary" to={routes.dashboard}>
        <Home size={17} /> Go home
      </Link>
    </main>
  );
}
