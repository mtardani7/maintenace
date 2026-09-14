import type { TicketPriority, TicketStatus } from './ticket-types';

export type OperationsFilters = {
  plant?: string;
  priority?: TicketPriority | '';
  status?: TicketStatus | '';
  date?: string;
};

export type OperationalStats = {
  open: number;
  unassigned: number;
  assigned: number;
  inProgress: number;
  overdue: number;
  resolvedToday: number;
  closedToday: number;
};

export type AttentionTicket = {
  id: number | string;
  number: string;
  machine: string;
  problem: string;
  priority: TicketPriority;
  status: TicketStatus;
  sla?: { status: 'ON_TRACK' | 'DUE_SOON' | 'OVERDUE'; targetAt?: string; remaining?: string; overdueDuration?: string };
};

export type TechnicianWorkload = {
  technicianId: number | string;
  technician: string;
  assigned: number;
  inProgress: number;
  overdue: number;
  resolved: number;
};

export type SupervisorOverview = {
  unassigned: AttentionTicket[];
  critical: AttentionTicket[];
  overdue: AttentionTicket[];
  workload: TechnicianWorkload[];
  repeatedFailures: { machineId: number | string; machine: string; count: number }[];
};

export type ReportMetrics = {
  mttr?: string;
  mtbf?: string;
  totalDowntime?: string;
  responseTime?: string;
  slaCompliance?: string;
  ticketVolume?: number;
  repeatFailures?: number;
  maintenanceByPlant?: { plant: string; total: number }[];
  topProblematicMachines?: { machine: string; total: number }[];
  topFailureTypes?: { type: string; total: number }[];
};

export type MachineAnalytics = {
  totalIncidents?: number;
  maintenanceTickets?: number;
  openTickets?: number;
  repeatFailures?: number;
  totalDowntime?: string;
  latestMaintenance?: string;
};
