import {
  Cloud,
  Grid2X2,
  HelpCircle,
  Home,
  Server,
  ShieldCheck,
  Sparkles,
  SquareKanban,
  UserRound,
} from 'lucide-react';
import type { ComponentType } from 'react';
import { NavLink } from 'react-router-dom';
import {
  adminNavigation,
  householdNavigation,
  utilityNavigation,
  type NavigationItem,
} from '../../config/navigation';
import type { UserRole } from '../../types/domain';

interface NavigationGroupProps {
  items: NavigationItem[];
  role: UserRole | undefined;
  onNavigate?: () => void;
}

interface NavigationLinksProps {
  role: UserRole | undefined;
  onNavigate?: () => void;
}

const icons: Record<
  NavigationItem['icon'],
  ComponentType<{ size?: number; 'aria-hidden'?: boolean }>
> = {
  home: Home,
  grid: Grid2X2,
  sparkles: Sparkles,
  cloud: Cloud,
  notion: SquareKanban,
  shield: ShieldCheck,
  server: Server,
  user: UserRound,
  help: HelpCircle,
};
function NavigationGroup({ items, role, onNavigate }: NavigationGroupProps) {
  // The role filter decides visibility before JSX is created. Backend authorization remains separate.
  return items
    .filter((item) => role && item.roles.includes(role))
    .map((item) => {
      const Icon = icons[item.icon];
      return (
        // NavLink reads the current router location and supplies `isActive` to the class callback.
        <NavLink
          key={item.to}
          to={item.to}
          onClick={onNavigate}
          className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
        >
          <Icon size={19} aria-hidden={true} />
          <span>{item.label}</span>
        </NavLink>
      );
    });
}
/**
 * Navigation is data-driven and receives the signed-in role as a prop. The separate administrator
 * group is shown only for admins; the matching route guard still handles direct URL visits.
 */
export function NavigationLinks({ role, onNavigate }: NavigationLinksProps) {
  return (
    <nav aria-label="Main navigation">
      {/* Data comes from config/navigation.ts rather than hard-coded links in this component. */}
      <p className="nav-label">Household</p>
      <NavigationGroup items={householdNavigation} role={role} onNavigate={onNavigate} />

      {role === 'admin' && (
        <>
          {/* Visual admin grouping mirrors the AdminRoute wrapper in App.tsx. */}
          <p className="nav-label admin-label">Administrator</p>
          <NavigationGroup items={adminNavigation} role={role} onNavigate={onNavigate} />
        </>
      )}

      {/* Profile and Help remain available to both signed-in roles. */}
      <p className="nav-label utility-label">Account</p>
      <NavigationGroup items={utilityNavigation} role={role} onNavigate={onNavigate} />
    </nav>
  );
}
