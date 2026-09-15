export type MachineStatus = 'running' | 'stopped' | 'maintenance' | 'offline' | 'unknown';

export type Machine = {
  id: number | string;
  code: string;
  name: string;
  plant: string;
  line: string;
  location: string;
  status: MachineStatus;
  machine_number?: string;
  is_active?: boolean;
  plant_id?: number;
  line_id?: number;
  approval_status?: 'pending' | 'approved' | 'rejected';
  requested_by?: number | string;
};
export type MachineQADefect = {
  id: number | string;
  defectId: string;
  defectType: string;
  maintenanceTicket?: { id: number | string; number: string; status: string };
};

export type Incident = {
  id: number | string;
  plantId?: number | string;
  machineId?: number | string;
  problemType: string;
  description: string;
  actionTaken?: string;
  result?: string;
  status?: string;
  createdAt: string;
};

export type MaintenanceTicket = {
  id: number | string;
  problemType: string;
  description: string;
  status?: string;
  createdAt: string;
};

export type MachineDetail = Machine & {
  recentIncidents: Incident[];
  openTickets: MaintenanceTicket[];
  qaDefects?: MachineQADefect[];
  analytics?: import('./operations-types').MachineAnalytics;
};

export type MachineFilters = {
  search?: string;
  plant?: string;
  status?: MachineStatus | '';
  page?: number;
  per_page?: number;
};

export type MachinePage = { data: Machine[]; current_page: number; last_page: number; per_page: number; total: number };

export type CreateIncidentInput = {
  plantId: number | string;
  machineId: Machine['id'];
  problemType: string;
  description: string;
  actionTaken: string;
  result: string;
};

export type CreateTicketInput = {
  plantId: number | string;
  machineId: Machine['id'];
  problemType: string;
  description: string;
  source: 'OPERATOR';
};
