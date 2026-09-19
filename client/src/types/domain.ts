/** Shared domain types mirror the normalized shapes a future HomeHub API will return. */
export type UserRole = 'admin' | 'user';

export type ServiceStatus = 'online' | 'maintenance' | 'offline' | 'not-configured';

export type DataScenario =
  'success' | 'loading' | 'empty' | 'stale' | 'offline' | 'error' | 'partial';

export interface User {
  id: string;
  displayName: string;
  email: string;
  role: UserRole;
}

export interface ServiceDefinition {
  id: string;
  name: string;
  description: string;
  icon: 'sparkles' | 'cloud' | 'notion' | 'shield' | 'server';
  destination: string;
  external: boolean;
  category: 'local' | 'external';
  status: ServiceStatus;
  roles: UserRole[];
}

/** One task shape powers both the daily list and calendar; date uses local YYYY-MM-DD form. */
export interface Task {
  id: string;
  title: string;
  date: string;
  project: string;
  completed: boolean;
  description?: string;
  priority?: 'low' | 'medium' | 'high';
}

export interface NotionDashboardResponse {
  tasks: Task[];
  lastSyncedAt: string;
  state: Exclude<DataScenario, 'loading' | 'partial'>;
}

export interface AiModel {
  id: string;
  name: string;
  description: string;
  contextSize: string;
  available: boolean;
}

export interface AiMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  createdAt: string;
  simulated?: boolean;
}

export interface StorageSummary {
  usedGb: number;
  totalGb: number;
  status: ServiceStatus;
  updatedAt: string;
  recentFiles: Array<{
    id: string;
    name: string;
    kind: string;
    modifiedAt: string;
  }>;
}

export interface Metric {
  id: string;
  label: string;
  value: string;
  detail: string;
  percent?: number;
  status: 'healthy' | 'warning' | 'critical';
}

export interface ContainerHealth {
  id: string;
  name: string;
  category: string;
  status: 'running' | 'stopped' | 'unhealthy';
  uptime: string;
  lastCheck: string;
  version: string;
}
