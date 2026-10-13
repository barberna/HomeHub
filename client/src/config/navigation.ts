import type { ServiceDefinition, UserRole } from '../types/domain';
import { appConfig, routes } from './appConfig';

export interface NavigationItem {
  label: string;
  to: string;
  icon: ServiceDefinition['icon'] | 'home' | 'grid' | 'user' | 'help' | 'sparkles';
  roles: UserRole[];
}

// Reusing one typed array keeps household and utility items available to both demo roles.
const everyone: UserRole[] = ['admin', 'user'];
/** AppShell renders this group under the "Household" navigation label. */
export const householdNavigation: NavigationItem[] = [
  { label: 'Dashboard', to: routes.dashboard, icon: 'home', roles: everyone },
  { label: 'All services', to: routes.services, icon: 'grid', roles: everyone },
  { label: 'JellyFin', to: routes.jellyFin, icon: 'movie', roles: everyone },
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


// This Type is defined in domain.ts, this list of objects is maped to display 
// all services in services page using our service card Component. 
export const services: ServiceDefinition[] = [
  {
    id: 'jellyfin',
    name: 'Media Library',
    description: 'Browse your library, resume watching, and request movies.',
    icon: 'movie',
    destination: routes.jellyFin,
    external: false,
    category: 'local',
    status: 'not-configured',
    roles: everyone,
  },
];
