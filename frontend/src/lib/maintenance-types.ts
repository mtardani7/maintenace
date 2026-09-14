export type MachineStatus = 'running' | 'stopped' | 'maintenance' | 'offline' | 'unknown';

export type Machine = {
  id: number | string;
  code: string;
  name: string;
  plant: string;
  line: string;
  location: string;
  status: MachineStatus;
};
export type MachineQADefect = {
  id: number | string;
  defectId: string;
  defectType: string;
  maintenanceTicket?: { id: number | string; number: string; status: string };
};

export type Incident = {
  id: number | string;
  problemType: string;
  description: string;
  actionTaken?: string;
  result?: string;
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
};

export type CreateIncidentInput = {
  machineId: Machine['id'];
  problemType: string;
  description: string;
  actionTaken: string;
  result: string;
};

export type CreateTicketInput = {
  machineId: Machine['id'];
  problemType: string;
  description: string;
  source: 'OPERATOR';
};
