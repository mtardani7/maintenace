import { apiDownload, apiRequest, ApiConfigurationError, ApiError } from './api';
import type { MachineAnalytics } from './operations-types';
import type { OperationsFilters, OperationalStats, ReportMetrics, SupervisorOverview } from './operations-types';

type Paths = { stats?: string; attention?: string; supervisor?: string; reports?: string; export?: string; machineAnalytics?: string };
const paths: Paths = {
  stats: process.env.NEXT_PUBLIC_OPERATIONS_STATS_PATH,
  attention: process.env.NEXT_PUBLIC_OPERATIONS_ATTENTION_PATH,
  supervisor: process.env.NEXT_PUBLIC_SUPERVISOR_OVERVIEW_PATH,
  reports: process.env.NEXT_PUBLIC_REPORTS_METRICS_PATH,
  export: process.env.NEXT_PUBLIC_REPORTS_EXPORT_PATH,
  machineAnalytics: process.env.NEXT_PUBLIC_MACHINE_ANALYTICS_PATH_TEMPLATE,
};

function required(value: string | undefined, label: string) { if (!value) throw new ApiConfigurationError(`${label} endpoint is not configured yet.`); return value; }
function query(path: string, filters: OperationsFilters) { const params = new URLSearchParams(); if (filters.plant) params.set('plant', filters.plant); if (filters.priority) params.set('priority', filters.priority); if (filters.status) params.set('status', filters.status); if (filters.date) params.set('date', filters.date); const suffix = params.toString(); return suffix ? `${path}${path.includes('?') ? '&' : '?'}${suffix}` : path; }

export async function getOperationalStats(filters: OperationsFilters = {}) { return apiRequest<OperationalStats>(query(required(paths.stats, 'Operational statistics'), filters)); }
export async function getAttentionTickets(filters: OperationsFilters = {}) { return apiRequest<import('./operations-types').AttentionTicket[]>(query(required(paths.attention, 'Attention queue'), filters)); }
export async function getSupervisorOverview(filters: OperationsFilters = {}) { return apiRequest<SupervisorOverview>(query(required(paths.supervisor, 'Supervisor overview'), filters)); }
export async function getReportMetrics(filters: OperationsFilters = {}) { return apiRequest<ReportMetrics>(query(required(paths.reports, 'Report metrics'), filters)); }
export async function getMachineAnalytics(id: string | number) { return apiRequest<MachineAnalytics>(required(paths.machineAnalytics, 'Machine analytics').replace('{id}', encodeURIComponent(String(id)))); }
export async function exportReports(filters: OperationsFilters = {}) { return apiDownload(query(required(paths.export, 'Report export'), filters)); }

export function operationsApiMessage(error: unknown) { if (error instanceof ApiError) { if (error.status === 401) return 'Your session has expired. Sign in again to continue.'; if (error.status === 403) return 'You do not have permission to view this operational data.'; if (error.status === 404) return 'The requested operational data was not found.'; if (error.status === 422) return error.message || 'Check the selected filters and try again.'; if (error.status >= 500) return 'The operations service is having trouble. Try again shortly.'; } if (error instanceof ApiConfigurationError) return error.message; if (error instanceof TypeError) return 'The operations service could not be reached. Check your connection.'; return 'The operational request could not be completed.'; }
