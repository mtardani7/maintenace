import { apiRequest, ApiConfigurationError } from './api';
import type { CreateIncidentInput, CreateTicketInput, Incident, Machine, MachineDetail, MachineFilters, MaintenanceTicket, MachineQADefect } from './maintenance-types';
import { getMachineAnalytics } from './operations-api';

type Collection<T> = T[] | { data: T[]; meta?: { current_page?: number; last_page?: number; total?: number } };

const paths = {
  machines: process.env.NEXT_PUBLIC_MACHINES_PATH,
  machineDetail: process.env.NEXT_PUBLIC_MACHINE_DETAIL_PATH_TEMPLATE,
  machineIncidents: process.env.NEXT_PUBLIC_MACHINE_INCIDENTS_PATH_TEMPLATE,
  machineTickets: process.env.NEXT_PUBLIC_MACHINE_TICKETS_PATH_TEMPLATE,
    machineQaDefects: process.env.NEXT_PUBLIC_MACHINE_QA_DEFECTS_PATH_TEMPLATE,
  createIncident: process.env.NEXT_PUBLIC_INCIDENTS_CREATE_PATH,
  createTicket: process.env.NEXT_PUBLIC_TICKETS_CREATE_PATH,
};

function requiredPath(value: string | undefined, label: string): string {
  if (!value) throw new ApiConfigurationError(`${label} endpoint is not configured yet.`);
  return value;
}

function withQuery(path: string, filters: MachineFilters): string {
  const query = new URLSearchParams();
  if (filters.search) query.set('search', filters.search);
  if (filters.plant) query.set('plant', filters.plant);
  if (filters.status) query.set('status', filters.status);
  const suffix = query.toString();
  return suffix ? `${path}${path.includes('?') ? '&' : '?'}${suffix}` : path;
}

function collection<T>(response: Collection<T>): T[] {
  return Array.isArray(response) ? response : response.data;
}

function pathFor(template: string | undefined, id: Machine['id'], label: string): string {
  return requiredPath(template, label).replace('{id}', encodeURIComponent(String(id)));
}

export function maintenanceApiAvailability() {
  return Boolean(paths.machines);
}

export async function getMachines(filters: MachineFilters = {}): Promise<Machine[]> {
  const response = await apiRequest<Collection<Machine>>(withQuery(requiredPath(paths.machines, 'Machine list'), filters));
  return collection(response);
}

export async function getMachineDetail(id: Machine['id']): Promise<MachineDetail> {
  const machine = await apiRequest<Machine>(pathFor(paths.machineDetail, id, 'Machine detail'));
  const [recentIncidents, openTickets] = await Promise.all([
    getMachineIncidents(id),
    getMachineTickets(id),
  ]);
  const qaDefects = paths.machineQaDefects ? await getMachineQADefects(id).catch(() => []) : undefined;
  const analytics = process.env.NEXT_PUBLIC_MACHINE_ANALYTICS_PATH_TEMPLATE ? await getMachineAnalytics(id).catch(() => undefined) : undefined;
  return { ...machine, recentIncidents, openTickets, qaDefects, analytics };
}

async function getMachineQADefects(id: Machine['id']) {
  const response = await apiRequest<Collection<MachineQADefect>>(pathFor(paths.machineQaDefects, id, 'Machine QA defects'));
  return collection(response);
}

export async function getMachineIncidents(id: Machine['id']): Promise<Incident[]> {
  const response = await apiRequest<Collection<Incident>>(pathFor(paths.machineIncidents, id, 'Machine incidents'));
  return collection(response);
}

export async function getMachineTickets(id: Machine['id']): Promise<MaintenanceTicket[]> {
  const response = await apiRequest<Collection<MaintenanceTicket>>(pathFor(paths.machineTickets, id, 'Machine tickets'));
  return collection(response);
}

export async function createIncident(input: CreateIncidentInput) {
  return apiRequest<Incident>(requiredPath(paths.createIncident, 'Incident creation'), {
    method: 'POST',
    body: JSON.stringify({
      machine_id: input.machineId,
      problem_type: input.problemType,
      description: input.description,
      action_taken: input.actionTaken,
      result: input.result,
    }),
  });
}

export async function createTicket(input: CreateTicketInput) {
  return apiRequest<MaintenanceTicket>(requiredPath(paths.createTicket, 'Ticket creation'), {
    method: 'POST',
    body: JSON.stringify({
      machine_id: input.machineId,
      problem_type: input.problemType,
      description: input.description,
      source: input.source,
    }),
  });
}
