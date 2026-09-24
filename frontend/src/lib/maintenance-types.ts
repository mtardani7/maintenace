export type MachineStatus = 'running' | 'stopped' | 'maintenance' | 'offline' | 'unknown';

export type Plant = {
  id: number;
  code: string;
  name: string;
  description?: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export type Machine = {
  id: number | string;
  code: string;
  name: string;
  plant_id: number | string;
  section?: string;
  is_active: boolean;
  status?: MachineStatus;
  line_id?: number;
  created_by?: number | string;
  updated_by?: number | string;
  created_at?: string;
  updated_at?: string;
  plant?: string;
  line?: string;
  location?: string;
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
  description?: string;
  actionTaken?: string;
  result?: string;
  status?: 'OPEN' | 'RESOLVED';
  createdAt: string;
};

export type MaintenanceTicket = {
  id: number | string;
  number?: string;
  problemType: string;
  description?: string;
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
  status?: string;
  page?: number;
  per_page?: number;
};

export type MachinePage = { data: Machine[]; current_page: number; last_page: number; per_page: number; total: number };

export type CreateIncidentInput = {
  plantId: number | string;
  machineId: Machine['id'];
  problemType: string;
  description: string;
  actionTaken?: string;
  result?: string;
  status: 'OPEN' | 'RESOLVED';
};

export type CreateTicketInput = {
  plantId: number | string;
  machineId: Machine['id'];
  problemType: string;
  description: string;
  source: 'OPERATOR';
};
