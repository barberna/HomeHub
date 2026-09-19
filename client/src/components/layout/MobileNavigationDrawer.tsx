import { LogOut, X } from 'lucide-react';
import type { RefObject } from 'react';
import type { UserRole } from '../../types/domain';
import { AppBrand } from './AppBrand';
import { NavigationLinks } from './NavigationLinks';
interface MobileNavigationDrawerProps {
  role: UserRole | undefined;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  onClose: () => void;
  onNavigate: () => void;
  onSignOut: () => void;
}

/** Presentational drawer; AppShell remains responsible for open state and keyboard focus behavior. */
export function MobileNavigationDrawer({
  role,
  closeButtonRef,
  onClose,
  onNavigate,
  onSignOut,
}: MobileNavigationDrawerProps) {
  return (
    <>
      {/* Clicking the dimmed page background uses the same close/focus-return callback as X. */}
      <button className="drawer-backdrop" aria-label="Close navigation" onClick={onClose} />

      <aside id="mobile-navigation" className="mobile-drawer" aria-label="Mobile navigation">
        {/* closeButtonRef is focused by AppShell immediately after this drawer mounts. */}
        <div className="drawer-heading">
          <AppBrand />

          <button
            ref={closeButtonRef}
            className="icon-button"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X />
          </button>
        </div>

        {/* Reuses the desktop navigation data; onNavigate closes the drawer after route selection. */}
        <NavigationLinks role={role} onNavigate={onNavigate} />

        {/* Delegates sign-out to AppShell, which calls AuthContext and redirects to `/login`. */}
        <button className="button secondary drawer-signout" onClick={onSignOut}>
          <LogOut size={17} />
          Sign out
        </button>
      </aside>
    </>
  );
}
