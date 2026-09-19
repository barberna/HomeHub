import type {
  AiMessage,
  AiModel,
  ContainerHealth,
  Metric,
  StorageSummary,
  Task,
} from '../../types/domain';

function isoDate(offsetDays = 0): string {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().slice(0, 10);
}
export const mockTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Plan the family meal',
    date: isoDate(),
    project: 'Home',
    completed: false,
    priority: 'medium',
  },
  {
    id: 'task-2',
    title: 'Review photo backup',
    date: isoDate(),
    project: 'Digital home',
    completed: true,
    priority: 'low',
  },
  {
    id: 'task-3',
    title: 'Water balcony herbs',
    date: isoDate(1),
    project: 'Home',
    completed: false,
  },
  {
    id: 'task-4',
    title: 'Prepare study notes',
    date: isoDate(3),
    project: 'Learning',
    completed: false,
    priority: 'high',
  },
  {
    id: 'task-5',
    title: 'Check shared calendar',
    date: isoDate(3),
    project: 'Family',
    completed: false,
  },
  {
    id: 'task-6',
    title: 'Archive old receipts',
    date: isoDate(3),
    project: 'Home',
    completed: false,
  },
  {
    id: 'task-7',
    title: 'Choose weekend movie',
    date: isoDate(3),
    project: 'Family',
    completed: true,
  },
  {
    id: 'task-8',
    title: 'Run monthly backup review',
    date: isoDate(8),
    project: 'Digital home',
    completed: false,
  },
];
export const aiModels: AiModel[] = [
  {
    id: 'llama-home-8b',
    name: 'Llama Home 8B',
    description: 'Balanced household assistant demo profile.',
    contextSize: '8K context',
    available: true,
  },
  {
    id: 'qwen-coder-7b',
    name: 'Qwen Coder 7B',
    description: 'Code-focused local model demo profile.',
    contextSize: '16K context',
    available: true,
  },
  {
    id: 'mistral-lite',
    name: 'Mistral Lite',
    description: 'Fast compact model, currently unavailable.',
    contextSize: '8K context',
    available: false,
  },
];
export const initialMessages: AiMessage[] = [
  {
    id: 'welcome',
    sender: 'assistant',
    text: 'Hi! I am a simulated preview of your future local HomeHub assistant. What would you like to plan?',
    createdAt: new Date().toISOString(),
    simulated: true,
  },
];
export const storageSummary: StorageSummary = {
  usedGb: 382,
  totalGb: 1000,
  status: 'online',
  updatedAt: new Date(Date.now() - 8 * 60_000).toISOString(),
  recentFiles: [
    { id: 'file-1', name: 'Summer recipes.pdf', kind: 'PDF', modifiedAt: 'Today, 9:14 AM' },
    { id: 'file-2', name: 'Garden photos', kind: 'Folder', modifiedAt: 'Yesterday' },
    { id: 'file-3', name: 'Household budget.xlsx', kind: 'Spreadsheet', modifiedAt: 'July 30' },
  ],
};
export const monitoringMetrics: Metric[] = [
  {
    id: 'uptime',
    label: 'Uptime',
    value: '18d 7h',
    detail: 'Stable since last planned restart',
    status: 'healthy',
  },
  {
    id: 'cpu',
    label: 'CPU load',
    value: '24%',
    detail: 'Down 4% over the last hour',
    percent: 24,
    status: 'healthy',
  },
  {
    id: 'memory',
    label: 'Memory',
    value: '61%',
    detail: '9.8 GB of 16 GB',
    percent: 61,
    status: 'healthy',
  },
  {
    id: 'disk',
    label: 'Primary disk',
    value: '72%',
    detail: '278 GB free',
    percent: 72,
    status: 'warning',
  },
  {
    id: 'temperature',
    label: 'Temperature',
    value: '48°C',
    detail: 'Within normal range',
    percent: 48,
    status: 'healthy',
  },
  {
    id: 'network',
    label: 'Network',
    value: '38 Mbps',
    detail: '12 Mbps outbound',
    percent: 38,
    status: 'healthy',
  },
];
export const containerHealth: ContainerHealth[] = [
  {
    id: 'c1',
    name: 'Nextcloud web',
    category: 'Cloud',
    status: 'running',
    uptime: '18 days',
    lastCheck: '12 sec ago',
    version: 'Demo 31.x',
  },
  {
    id: 'c2',
    name: 'HomeHub frontend',
    category: 'Portal',
    status: 'running',
    uptime: '6 days',
    lastCheck: '10 sec ago',
    version: 'Demo 1.0',
  },
  {
    id: 'c3',
    name: 'Pi-hole resolver',
    category: 'Network',
    status: 'running',
    uptime: '18 days',
    lastCheck: '18 sec ago',
    version: 'Demo 6.x',
  },
  {
    id: 'c4',
    name: 'Backup verifier',
    category: 'Maintenance',
    status: 'unhealthy',
    uptime: '42 min',
    lastCheck: '1 min ago',
    version: 'Demo 2.4',
  },
  {
    id: 'c5',
    name: 'Photo indexer',
    category: 'Media',
    status: 'stopped',
    uptime: '—',
    lastCheck: '4 min ago',
    version: 'Demo 4.1',
  },
];
/**
 * Fictional records shaped like future API responses. Backend integration removes imports of this
 * file from service adapters; pages and reusable components should never import it directly.
 */
