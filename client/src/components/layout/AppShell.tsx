/** Shared authenticated layout owns navigation, mobile drawer focus, and page-title updates. */
import { Menu } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { Outlet, replace, useLocation, useNavigate } from 'react-router-dom';
import { routes } from '../../config/appConfig';
import { adminNavigation, householdNavigation, utilityNavigation } from '../../config/navigation';
import { useAuth } from '../../context/useAuth';
import { AppBrand } from './AppBrand';
import { MobileNavigationDrawer } from './MobileNavigationDrawer';
import { NavigationLinks } from './NavigationLinks';
import { UserAccountCard } from './UserAccountCard';

/*
In your project, it handles:
- The sidebar and navigation.
- Opening and closing the mobile menu.
- Updating the browser’s page title.
- Displaying the current page through <Outlet />.
- Connecting the logout button to your auth context and redirecting afterward.
*/

const allNavigationItems = [...householdNavigation, ...adminNavigation, ...utilityNavigation];

export function AppShell() {
  // Drawer state belongs in the shell because both the mobile header and drawer need to change it.
  const [drawerOpen, setDrawerOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  
  useEffect(() => {
    const currentPageLabel =
      allNavigationItems.find((item) => location.pathname === item.to)?.label ?? 'HomeHub';
    document.title = `${currentPageLabel} | HomeHub`;
    setDrawerOpen(false);
  }, [location.pathname]);
  
  useEffect(() => {
    if (!drawerOpen) {
      return;
    }
    // Focus enters the drawer when it opens so keyboard users do not remain behind the overlay.
    closeButtonRef.current?.focus();
    
    function handleDrawerKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        closeDrawerAndRestoreFocus();
      }

      if (event.key !== 'Tab') {
        return;
      }

      const drawer = document.querySelector<HTMLElement>('.mobile-drawer');
      const focusableElements = drawer?.querySelectorAll<HTMLElement>('button, a[href]');

      if (!focusableElements?.length) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      // Cycling focus inside the open drawer prevents keyboard focus from moving behind it.
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault();
        lastElement.focus();
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault();
        firstElement.focus();
      }
    }


    document.addEventListener('keydown', handleDrawerKeyDown);
    document.body.classList.add('drawer-visible');
    // Effects clean up global listeners and body classes when the drawer closes or shell unmounts.
    return () => {
      document.removeEventListener('keydown', handleDrawerKeyDown);
      document.body.classList.remove('drawer-visible');
    };
  }, [drawerOpen]);
  
  function closeDrawerAndRestoreFocus() {
    setDrawerOpen(false);
    menuButtonRef.current?.focus();
  }

  async function handleSignOut() {
    await signOut();
    navigate(routes.login, { replace: true });
  }

  return (
    <div className="app-shell">
      {/* First keyboard-focusable link bypasses repeated navigation and targets the main landmark. */}
      <a className="skip-link" href="#main-content">
        Skip to main content
      </a>

      {/* Desktop/tablet sidebar: brand, role-filtered links, then the shared context user. */}
      <aside className="sidebar">
        <AppBrand />
        <NavigationLinks role={user?.role} />
        <UserAccountCard user={user} onSignOut={handleSignOut} />
      </aside>

      {/* Mobile CSS hides the sidebar and shows this compact header/menu trigger instead. */}
      <header className="mobile-header">
        <AppBrand />

        <button
          ref={menuButtonRef}
          className="icon-button"
          onClick={() => setDrawerOpen(true)}
          aria-expanded={drawerOpen}
          aria-controls="mobile-navigation"
          aria-label="Open navigation"
        >
          <Menu />
        </button>
      </header>

      {/* The drawer is mounted only while open; callbacks return state changes to AppShell. */}
      {drawerOpen && (
        <MobileNavigationDrawer
          role={user?.role}
          closeButtonRef={closeButtonRef}
          onClose={closeDrawerAndRestoreFocus}
          onNavigate={() => setDrawerOpen(false)}
          onSignOut={() => void handleSignOut()}
        />
      )}

      {/* Outlet renders the currently matched child page from App.tsx inside the shared shell. */}
      {/* tabIndex lets the skip link move keyboard focus to the main landmark. */}
      <main id="main-content" tabIndex={-1}>
        <Outlet />
      </main>
    </div>
  );
}
