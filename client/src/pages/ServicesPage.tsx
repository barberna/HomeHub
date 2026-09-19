/** ServicesPage turns role-filtered service configuration into a reusable card catalog. */
import { DemoBadge, PageHeader } from '../components/ui/Ui';
import { ServiceCard } from '../components/services/ServiceCard';
import { services } from '../config/navigation';
import { useAuth } from '../context/useAuth';
export function ServicesPage() {
  const { user } = useAuth();
  // Role filtering changes what is visible in the prototype. The future backend must independently
  // enforce the same permissions when it returns service data or handles protected requests.
  const visible = services.filter((service) => user && service.roles.includes(user.role));
  return (
    <div className="page">
      {/* PageHeader is visual only; the badge occupies its optional actions slot. */}
      <PageHeader
        eyebrow="Service library"
        title="Everything in one place"
        description="Launch household tools."
        actions={null}
      />

      {/*
       * Each ServiceCard receives one object from config/navigation.ts. The object's `destination`
       * and `external` fields determine whether clicking opens a HomeHub route or a new browser tab.
       */}
      
      <div className="service-grid">
        {visible.length === 0 ? (
           <p role='alert'>Currently no services are available for your role.</p>
        ) : (
            visible.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))
        )}
      </div>
    </div>
  );
}
