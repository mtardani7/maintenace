import { apiRequest, ApiConfigurationError, ApiError } from "./api";
import type {
  Ticket,
  TicketAction,
  TicketActionInput,
  TicketFilters,
  TicketPage,
} from "./ticket-types";

type TicketCollection =
  | Ticket[]
  | {
      data: Ticket[];
      meta?: { current_page?: number; last_page?: number; total?: number };
    };

const paths = {
  list: process.env.NEXT_PUBLIC_TICKETS_PATH || "/tickets",
  detail:
    process.env.NEXT_PUBLIC_TICKET_DETAIL_PATH_TEMPLATE || "/tickets/{id}",
  action:
    process.env.NEXT_PUBLIC_TICKET_ACTION_PATH_TEMPLATE ||
    "/tickets/{id}/actions/{action}",
  stats: process.env.NEXT_PUBLIC_TICKET_STATS_PATH,
};

export type TicketStats = {
  open: number;
  unassigned: number;
  assigned: number;
  inProgress: number;
  overdue: number;
  resolvedToday: number;
};

export function ticketApiAvailability() {
  return Boolean(paths.list);
}

function requiredPath(value: string | undefined, label: string) {
  if (!value)
    throw new ApiConfigurationError(`${label} endpoint is not configured yet.`);
  return value;
}

function withQuery(path: string, filters: TicketFilters) {
  const query = new URLSearchParams();
  if (filters.search) query.set("search", filters.search);
  if (filters.status) query.set("status", filters.status);
  if (filters.priority) query.set("priority", filters.priority);
  if (filters.plant) query.set("plant", filters.plant);
  if (filters.technician) query.set("technician", filters.technician);
  if (filters.sort) query.set("sort", filters.sort);
  if (filters.page) query.set("page", String(filters.page));
  const suffix = query.toString();
  return suffix ? `${path}${path.includes("?") ? "&" : "?"}${suffix}` : path;
}

function replacePath(
  template: string | undefined,
  id: Ticket["id"],
  label: string,
  action?: TicketAction,
) {
  return requiredPath(template, label)
    .replace("{id}", encodeURIComponent(String(id)))
    .replace("{action}", action ?? "");
}

function normalizeTicket(
  ticket: Partial<Ticket> & Record<string, unknown>,
): Ticket {
  const machineId = (ticket.machine_id ??
    (ticket.machine as { id?: number | string } | undefined)?.id ??
    "-") as number | string;
  const machine = ticket.machine as
    { id?: number | string; code?: string; name?: string } | undefined;
  return {
    id: ticket.id ?? "-",
    number: String(ticket.number ?? ticket.ticket_number ?? `TKT-${ticket.id ?? "-"}`),
    machine: {
      id: machine?.id ?? machineId,
      code: machine?.code ?? `Mesin #${machineId}`,
      name: machine?.name ?? `Mesin #${machineId}`,
    },
    plant: String(
      ticket.plant ??
        ticket.plant_name ??
        (ticket.plant_id ? `Plant #${ticket.plant_id}` : "-"),
    ),
    location: String(ticket.location ?? "-"),
    problemType: String(ticket.problemType ?? ticket.problem_type ?? "Lainnya"),
    description: String(ticket.description ?? ""),
    priority: (ticket.priority ?? "MEDIUM") as Ticket["priority"],
    status: (ticket.status ?? "OPEN") as Ticket["status"],
    durationHours:
      ticket.durationHours ?? (ticket.duration_hours as number | undefined),
    solution: ticket.solution as string | undefined,
    reason: ticket.reason as string | undefined,
    sourceType: (ticket.sourceType ?? ticket.source) as Ticket["sourceType"],
    createdAt: String(ticket.createdAt ?? ticket.created_at ?? ""),
  };
}

export async function getTickets(
  filters: TicketFilters = {},
): Promise<TicketPage> {
  const response = await apiRequest<TicketCollection>(
    withQuery(requiredPath(paths.list, "Ticket list"), filters),
  );
  if (Array.isArray(response))
    return {
      data: response.map((ticket) =>
        normalizeTicket(ticket as Partial<Ticket> & Record<string, unknown>),
      ),
      currentPage: filters.page ?? 1,
      lastPage: 1,
      total: response.length,
    };
  return {
    data: response.data.map((ticket) =>
      normalizeTicket(ticket as Partial<Ticket> & Record<string, unknown>),
    ),
    currentPage: response.meta?.current_page ?? filters.page ?? 1,
    lastPage: response.meta?.last_page ?? 1,
    total: response.meta?.total ?? response.data.length,
  };
}

export function getTicket(id: Ticket["id"]) {
  return apiRequest<Partial<Ticket> & Record<string, unknown>>(
    replacePath(paths.detail, id, "Ticket detail"),
  ).then((ticket) => normalizeTicket(ticket));
}

export function getTicketStats() {
  return apiRequest<TicketStats>(
    requiredPath(paths.stats, "Ticket statistics"),
  );
}

export function performTicketAction(
  id: Ticket["id"],
  action: TicketAction,
  input: TicketActionInput = {},
) {
  const { durationHours, ...rest } = input;
  const body = {
    action,
    ...Object.fromEntries(
      Object.entries(rest).filter(
        ([, value]) => value !== undefined && value !== "",
      ),
    ),
    ...(durationHours ? { duration_hours: durationHours } : {}),
  };
  return apiRequest<Partial<Ticket> & Record<string, unknown>>(
    replacePath(paths.action, id, "Ticket actions", action),
    { method: "POST", body: JSON.stringify(body) },
  ).then((ticket) => normalizeTicket(ticket));
}

export function apiMessage(error: unknown) {
  if (error instanceof ApiError) {
    if (error.status === 401)
      return "Your session has expired. Sign in again to continue.";
    if (error.status === 403)
      return "You do not have permission to perform this action.";
    if (error.status === 404) return "This ticket could not be found.";
    if (error.status === 422)
      return error.message || "Check the required ticket fields and try again.";
    if (error.status >= 500)
      return "The maintenance service is having trouble. Try again shortly.";
  }
  if (error instanceof ApiConfigurationError) return error.message;
  if (error instanceof TypeError)
    return "The maintenance service could not be reached. Check your connection.";
  return "The request could not be completed.";
}
