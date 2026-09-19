/** Route guards improve prototype UX; only a future backend can enforce real authorization. */
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { routes } from '../../config/appConfig';
import { useAuth } from '../../context/useAuth';
export function ProtectedRoute() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  // Outlet renders whichever protected child route matched. Signed-out visitors keep the intended
  // path in navigation state so a future production login flow could return them there.
  return isAuthenticated ? (
    <Outlet />
  ) : (
    <Navigate to={routes.login} replace state={{ from: location.pathname }} />
  );
}
export function AdminRoute() {
  const { user } = useAuth();
  // This mirrors the admin-only navigation in the shell and also handles a directly entered URL.
  // It is a frontend usability guard, not security; a future backend must authorize every request.
  return user?.role === 'admin' ? <Outlet /> : <Navigate to={routes.forbidden} replace />;
}
