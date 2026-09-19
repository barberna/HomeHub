/** DashboardPage composes role-appropriate overview data returned by dashboardService. */
import { Activity, ArrowRight, CheckCircle2, Clock3, HardDrive, Server } from 'lucide-react';
import { Link } from 'react-router-dom';
import { PageHeader } from '../components/ui/Ui';
import { routes } from '../config/appConfig';
import { useAuth } from '../context/useAuth';

export function DashboardPage() {
  const { user } = useAuth();
  
  const current = new Date().toLocaleDateString('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
    });   
    
  return (
    <div className="page">
      {/* PageHeader supplies the shared h1 layout. DemoBadge is passed into its optional actions area. */}
      <PageHeader
        eyebrow={current}
        title={`Welcome home, ${user?.displayName.split(' ')[0]}.`}
        description="Here is a quiet snapshot of your household services."
        actions={null}
      />

      {/* This strip summarizes values already returned by dashboardService; it does not navigate. */}
      <section className="availability-strip" aria-label="Service availability">
        <span>
          <CheckCircle2 /> 0 services available
        </span>
      </section>

      {/*
       * The favorites section connects three parts of the app:
       * 1. `data.services` comes from dashboardService.
       * 2. ServiceCard decides whether its destination is an internal route or external link.
       * 3. The text link uses React Router to open the complete `/services` catalog.
       */}
      <section aria-labelledby="favorites-title">
        <div className="section-heading">
          <div>
            <p className="eyebrow">Quick access</p>
            <h2 id="favorites-title">Household favorites</h2>
          </div>
          <Link to={routes.services}>
            View all services <ArrowRight size={16} />
          </Link>
        </div>
        <div className="service-grid">
         <p>Coming Soon</p>
        </div>
      </section>

      {/* The two-column area becomes a single column at narrower CSS breakpoints. */}
      <div className="dashboard-columns">
        {/* Recent activity is ordinary mock response data, so these rows do not lead anywhere. */}
        <section className="panel">
          <div className="section-heading">
            <div>
              <p className="eyebrow">Latest updates</p>
              <h2>Recent activity</h2>
            </div>
            <Activity aria-hidden="true" />
          </div>
          <ul className="activity-list">
           <p>Coming Soon</p>
          </ul>
        </section>

        {/*
         * Admins receive a real React Router link to `/admin/monitoring`.
         * Normal users receive explanatory text instead, matching the AdminRoute restriction.
         */}
        <section className="panel household-note">
          <p className="eyebrow">Home network</p>
          <h2>Everything looks settled.</h2>
          <p>All everyday services are reachable in this simulated snapshot.</p>
          {user?.role === 'admin' ? (
            <Link className="button secondary" to={routes.createMember}>
              <Server size={17} /> Open Users
            </Link>
          ) : (
            <p className="subtle-note">
              Detailed infrastructure data is available only to the administrator.
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
