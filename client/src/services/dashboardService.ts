import { services } from '../config/navigation';
import { storageSummary } from '../data/mock/mockData';
import { wait } from './serviceHelpers';
import type { ServiceDefinition, UserRole } from '../types/domain';

export interface DashboardData {
  services: ServiceDefinition[];
  recentItems: string[];
  storagePercent: number;
}

/**
 * BACKEND INTEGRATION: Replace the mock body with GET /dashboard through
 * `apiRequest<DashboardData>`. The backend must derive the role from the authenticated session;
 * never trust a role value sent by the browser when deciding which services or activity to return.
 */
export const dashboardService = {
  async getDashboard(role: UserRole): Promise<DashboardData> {
    await wait(260);
    return {
      services: services.filter((service) => service.roles.includes(role)),
      recentItems: [],
      storagePercent: Math.round((storageSummary.usedGb / storageSummary.totalGb) * 100),
    };
  },
};
