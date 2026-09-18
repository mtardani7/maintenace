import type { Role } from "./types";

export type TicketStatus =
  "OPEN" | "ASSIGNED" | "IN_PROGRESS" | "RESOLVED" | "VERIFIED" | "CLOSED";
export type TicketPriority = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";

export type Ticket = {
  id: number | string;
  number: string;
  machine: { id: number | string; code: string; name: string };
  plant: string;
  location: string;
  problemType: string;
  description: string;
  priority: TicketPriority;
  status: TicketStatus;
  durationHours?: number;
  solution?: string;
  reason?: string;
  sourceType?: "OPERATOR" | "QA" | "MANUAL";
  sourceId?: string;
  reporter?: { id: number | string; name: string };
  technician?: { id: number | string; name: string };
  createdAt: string;
  sla?: {
    status: "ON_TRACK" | "DUE_SOON" | "OVERDUE";
    dueAt?: string;
    targetAt?: string;
    remaining?: string;
    overdueDuration?: string;
  };
  attachments?: { id: number | string; name: string; url?: string }[];
  timeline?: TimelineEvent[];
};

export type TimelineEvent = {
  id: number | string;
  status: TicketStatus;
  label?: string;
  actor?: string;
  action?: string;
  change?: string;
  note?: string;
  createdAt: string;
};

export type TicketFilters = {
  search?: string;
  status?: TicketStatus | "";
  priority?: TicketPriority | "";
  plant?: string;
  technician?: string;
  sort?: "newest" | "oldest";
  page?: number;
};

export type TicketPage = {
  data: Ticket[];
  currentPage: number;
  lastPage: number;
  total: number;
};

export type TicketAction =
  | "accept"
  | "start"
  | "diagnosis"
  | "action"
  | "spare-part"
  | "photo"
  | "resolve"
  | "close"
  | "assign"
  | "priority"
  | "review"
  | "verify"
  | "reopen";

export type TicketActionInput = {
  durationHours?: number;
  solution?: string;
  reason?: string;
  diagnosis?: string;
  actionTaken?: string;
  spareParts?: string;
  repairNotes?: string;
  completionTime?: string;
  photo?: File;
  technicianId?: number | string;
  priority?: TicketPriority;
};

export const ticketStatuses: TicketStatus[] = [
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "RESOLVED",
  "VERIFIED",
  "CLOSED",
];
export const ticketPriorities: TicketPriority[] = [
  "CRITICAL",
  "HIGH",
  "MEDIUM",
  "LOW",
];
export const technicianRoles: Role[] = ["technician"];
export const supervisorRoles: Role[] = ["supervisor", "admin"];
