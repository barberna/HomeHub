/**
 * Public browser configuration shared by pages and service adapters. Vite replaces `import.meta.env`
 * while building the frontend, so every value here can be inspected by a browser user and must
 * never contain a token, password, or private server address.
 */
export const appConfig = {
  // Display name available to any component that needs product branding.
  appName: 'HomeHub',
  // apiClient prefixes future backend request paths with this public base URL.
  apiBaseUrl: import.meta.env.VITE_API_BASE_URL ?? '/api',
  // Reserved for a later service-adapter switch. Pages should not branch on this flag themselves.
  mockMode: (import.meta.env.VITE_DATA_MODE ?? 'mock') === 'mock',
};
/**
 * Central route names prevent pages, navigation config, and redirects from repeating path strings.
 * App.tsx declares which component renders for each path; Link/Navigate components use these values
 * to move through the single-page application without a full browser reload.
 */
export const routes = {
  login: '/login',
  dashboard: '/dashboard',
  services: '/services',
  profile: '/profile',
  help: '/help',
  forbidden: '/forbidden',
  setup: '/setup',
  createMember: '/admin/register',
  resetPassword: '/reset-password',
};
