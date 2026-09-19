/** ProfilePage reads the shared mock user and exposes the same context sign-out action as AppShell. */
import { LogOut, ShieldCheck, UserRound } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageHeader } from '../components/ui/Ui';
import { routes } from '../config/appConfig';
import { useAuth } from '../context/useAuth';

export function ProfilePage() {
  const { user, signOut } = useAuth();
  
  const navigate = useNavigate();
  
  async function handleSignOut() {
    // signOut clears AuthProvider state; navigate then sends the browser to the configured login route.
    await signOut();
    navigate(routes.login);
  }
  return (
    <div className="page">
      {/* Consistent page heading; this page does not provide a header action. */}
      <PageHeader
        eyebrow="Account"
        title="Profile"
        description="Your account information."
      />

      <div className="profile-grid">
        {/* User identity comes from AuthContext, which was populated during mock sign-in. */}
        <section className="panel profile-card">
          <span className="large-avatar">
            <UserRound />
          </span>
          <div>
            <h2>{user?.displayName}</h2>
            <p>{user?.email}</p>
            <span className="role-badge">
              <ShieldCheck size={15} />
              {user?.role === 'admin' ? 'Administrator' : 'Household member'}
            </span>
          </div>
        </section>
      </div>

      {/* Uses the same handleSignOut path as the sidebar account action. */}
      <button className="button danger" onClick={handleSignOut}>
        <LogOut size={17} /> Sign out
      </button>
    </div>
  );
}
