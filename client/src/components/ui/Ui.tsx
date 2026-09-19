/** Small shared presentation components keep status and page-heading behavior consistent. */
import {
  AlertTriangle,
  CheckCircle2,
  CircleOff,
  Clock3,
  LoaderCircle,
  type LucideIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import type { ContainerHealth, DataScenario, Metric, ServiceStatus } from '../../types/domain';

type StatusBadgeStatus = ServiceStatus | Metric['status'] | ContainerHealth['status'];

interface PageHeaderProps {
  eyebrow?: string;
  title: string;
  description: string;
  actions?: ReactNode;
}

interface StatePanelProps {
  state: DataScenario;
  title?: string;
  children?: ReactNode;
}

interface StateDescription {
  icon: LucideIcon;
  heading: string;
  text: string;
}

const statusLabels: Record<StatusBadgeStatus, string> = {
  online: 'Online',
  maintenance: 'Maintenance',
  offline: 'Offline',
  'not-configured': 'Not configured',
  healthy: 'Healthy',
  warning: 'Attention',
  critical: 'Critical',
  running: 'Running',
  stopped: 'Stopped',
  unhealthy: 'Unhealthy',
};
const stateDescriptions: Record<DataScenario, StateDescription> = {
  loading: {
    icon: LoaderCircle,
    heading: 'Loading demo data',
    text: 'HomeHub is preparing this view.',
  },
  empty: {
    icon: CircleOff,
    heading: 'Nothing here yet',
    text: 'There is no demo data for this selection.',
  },
  offline: {
    icon: CircleOff,
    heading: 'Service appears offline',
    text: 'Showing no live data. This is a demonstration state.',
  },
  error: {
    icon: AlertTriangle,
    heading: 'Something went wrong',
    text: 'The simulated service could not return this view.',
  },
  stale: {
    icon: Clock3,
    heading: 'Showing cached data',
    text: 'The last successful demo sync may be out of date.',
  },
  partial: {
    icon: AlertTriangle,
    heading: 'Some data is unavailable',
    text: 'Available sections remain visible below.',
  },
  success: {
    icon: CheckCircle2,
    heading: 'Ready',
    text: '',
  },
};
export function DemoBadge() {
  return <span className="demo-badge">Demo data</span>;
}
/** Always pairs the colored dot with readable text, so status never relies on color alone. */
export function StatusBadge({ status }: { status: StatusBadgeStatus }) {
  return (
    <span className={`status-badge status-${status}`}>
      <span aria-hidden="true">●</span>
      {statusLabels[status]}
    </span>
  );
}
/** Provides a consistent page title hierarchy while allowing each page to pass its own actions. */
export function PageHeader({ eyebrow, title, description, actions }: PageHeaderProps) {
  return (
    <header className="page-header">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        <p>{description}</p>
      </div>

      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}
/** Normalizes loading and failure messages while choosing an appropriate live-region role. */
export function StatePanel({ state, title, children }: StatePanelProps) {
  if (state === 'success') {
    return <>{children}</>;
  }
  const description = stateDescriptions[state];
  const StateIcon = description.icon;
  const liveRegionRole = state === 'error' || state === 'offline' ? 'alert' : 'status';
  return (
    <section className={`state-panel state-${state}`} role={liveRegionRole}>
      <StateIcon className={state === 'loading' ? 'spin' : undefined} />

      <div>
        <h2>{title ?? description.heading}</h2>
        <p>{description.text}</p>
        {children}
      </div>
    </section>
  );
}
/** Displays one typed metric and exposes percentage bars to assistive technology. */
export function MetricCard({ metric }: { metric: Metric }) {
  return (
    <article className="metric-card">
      <div className="metric-heading">
        <p>{metric.label}</p>
        <StatusBadge status={metric.status} />
      </div>

      <strong>{metric.value}</strong>
      <p>{metric.detail}</p>

      {metric.percent !== undefined && (
        <div
          className="progress"
          role="progressbar"
          aria-label={metric.label}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={metric.percent}
        >
          <span style={{ width: `${metric.percent}%` }} />
        </div>
      )}
    </article>
  );
}
