import {
  ArrowUpRight,
  Cloud,
  Server,
  ShieldCheck,
  Sparkles,
  SquareKanban,
  type LucideIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import type { ServiceDefinition } from '../../types/domain';
import { StatusBadge } from '../ui/Ui';
const icons: Record<ServiceDefinition['icon'], LucideIcon> = {
  sparkles: Sparkles,
  cloud: Cloud,
  notion: SquareKanban,
  shield: ShieldCheck,
  server: Server,
};
/** One data-driven card supports both internal routes and safe external launch links. */
export function ServiceCard({ service }: { service: ServiceDefinition }) {
  // config/navigation.ts stores an icon key instead of a React component. This lookup converts the
  // key into the matching Lucide component while keeping configuration serializable and readable.
  const Icon = icons[service.icon];
  // Both link types share exactly the same visible content; only their navigation behavior differs.
  const content = (
    <>
      {/* Decorative icon; the service name immediately below supplies the readable label. */}
      <div className="service-icon">
        <Icon aria-hidden="true" />
      </div>
      <div className="service-card-heading">
        <h3>{service.name}</h3>
        <StatusBadge status={service.status} />
      </div>
      <p>{service.description}</p>
      <span className="service-meta">
        {service.category === 'local' ? 'Home network' : 'External service'}
      </span>
      <span className="service-action">
        {service.external ? 'Open in new tab' : 'Open service'}{' '}
        <ArrowUpRight size={16} aria-hidden="true" />
      </span>
    </>
  );
  // External services use a normal anchor and new tab. HomeHub pages use React Router's Link so the
  // SPA changes routes without reloading. Both destinations come from the ServiceDefinition prop.
  return service.external ? (
    <a className="service-card" href={service.destination} target="_blank" rel="noreferrer">
      {content}
    </a>
  ) : (
    <Link className="service-card" to={service.destination}>
      {content}
    </Link>
  );
}
