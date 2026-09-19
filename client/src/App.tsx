/** App declares the route tree; pages stay separate from authentication and shell mechanics. */
import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/layout/AppShell';
import { AdminRoute, ProtectedRoute } from './components/routing/RouteGuards';
import { routes } from './config/appConfig';
import { DashboardPage } from './pages/DashboardPage';
import { HelpPage } from './pages/HelpPage';
import { LoginPage } from './pages/LoginPage';
import { ProfilePage } from './pages/ProfilePage';
import { ServicesPage } from './pages/ServicesPage';
import { ForbiddenPage, NotFoundPage } from './pages/system/SystemPages';
import { AdminLoginPage } from './pages/adminSetupPage'
import { CreateMemberPage } from './pages/CreateMemberPage';
import { ResetPasswordPage } from './pages/resetPasswordPage';

export default function App() {
  return (
    <Routes>
      <Route path={routes.setup} element={<AdminLoginPage/>}  />
      <Route path={routes.login} element={<LoginPage />} />
      <Route path={routes.resetPassword} element={<ResetPasswordPage/>} />
      
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<Navigate to={routes.dashboard} replace />} />
          <Route path={routes.dashboard} element={<DashboardPage />} />
          <Route path={routes.services} element={<ServicesPage />} />
          <Route path={routes.profile} element={<ProfilePage />} />
          <Route path={routes.help} element={<HelpPage />} />

          {/* These routes are nested under AdminRoute to match the administrator-only nav group. */}
          <Route element={<AdminRoute />}>
            <Route path={routes.createMember} element={<CreateMemberPage/>} />
          </Route>
          <Route path={routes.forbidden} element={<ForbiddenPage />} />
          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
