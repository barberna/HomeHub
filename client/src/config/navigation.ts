import type { ServiceDefinition, UserRole } from '../types/domain';
import { appConfig, routes } from './appConfig';

export interface NavigationItem {
  label: string;
  to: string;
  icon: ServiceDefinition['icon'] | 'home' | 'grid' | 'user' | 'help';
  roles: UserRole[];
}

// Reusing one typed array keeps household and utility items available to both demo roles.
const everyone: UserRole[] = ['admin', 'user'];
/** AppShell renders this group under the "Household" navigation label. */
export const householdNavigation: NavigationItem[] = [
  { label: 'Dashboard', to: routes.dashboard, icon: 'home', roles: everyone },
  { label: 'All services', to: routes.services, icon: 'grid', roles: everyone },
];
/** AppShell renders this visibly separate group only when the context user has the admin role. */
export const adminNavigation: NavigationItem[] = [
  { label: 'Users', to: routes.createMember, icon: 'user', roles: ['admin'] },
];
/** Account/help destinations appear after the household and optional administrator groups. */
export const utilityNavigation: NavigationItem[] = [
  { label: 'Profile', to: routes.profile, icon: 'user', roles: everyone },
  { label: 'Help', to: routes.help, icon: 'help', roles: everyone },
];
/**
 * Static prototype catalog. BACKEND INTEGRATION: GET /services may eventually provide status and
 * launch metadata, but route names and role-aware navigation should remain frontend configuration.
 * The backend must still filter its response using the authenticated server-side role.
 * ServicesPage and DashboardPage pass each object to ServiceCard. `external` tells ServiceCard to
 * use an ordinary anchor/new tab; otherwise it uses React Router with the internal destination.
 */
export const services: ServiceDefinition[] = [
  
];
