"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { getCurrentUser } from "@/lib/auth";
import { apiMessage, getTicket, performTicketAction } from "@/lib/ticket-api";
import {
  supervisorRoles,
  ticketPriorities,
  type Ticket,
  type TicketAction,
  type TicketActionInput,
  type TicketPriority,
} from "@/lib/ticket-types";
import type { Role } from "@/lib/types";
import { EmptyState, ErrorState, LoadingState } from "./ui";

function label(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
export function TicketDetailView({ ticketId }: { ticketId: string }) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [role, setRole] = useState<Role>("operator");
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);
  const [technicianId, setTechnicianId] = useState("");
  const [priority, setPriority] = useState<TicketPriority>("MEDIUM");
  const [ticketState, setTicketState] = useState<"open" | "close">("open");
  const [durationHours, setDurationHours] = useState("");
  const [solution, setSolution] = useState("");
  const [reason, setReason] = useState("");
  useEffect(() => {
    getTicket(ticketId)
      .then(setTicket)
      .catch((reason) => setError(apiMessage(reason)));
    getCurrentUser().then((result) => {
      if (result.status === "authenticated" && result.user.role)
        setRole(result.user.role);
    });
  }, [ticketId]);
  if (error)
    return <ErrorState title="Tiket tidak tersedia" description={error} />;
  if (!ticket) return <LoadingState label="Memuat tiket" />;
  const isTechnician = role === "technician";
  const isSupervisor = supervisorRoles.includes(role);
  function saveTicketState() {
    if (ticketState === "open" && !reason.trim()) {
      setActionError("Reason is required when opening a ticket.");
      return;
    }
    if (ticketState === "close" && !durationHours) {
      setActionError("Duration is required when closing a ticket.");
      return;
    }
    if (ticketState === "close" && !solution.trim()) {
      setActionError("Solution is required when closing a ticket.");
      return;
    }
    action(
      ticketState === "open" ? "reopen" : "close",
      ticketState === "open"
        ? { reason: reason.trim() }
        : { durationHours: Number(durationHours), solution: solution.trim() },
    );
  }
  async function action(
    actionType: TicketAction,
    input: TicketActionInput = {},
  ) {
    setActionError("");
    setBusy(true);
    try {
      setTicket(await performTicketAction(ticket!.number, actionType, input));
    } catch (reason) {
      setActionError(apiMessage(reason));
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="ticket-detail-layout">
      <main>
        <div className="ticket-detail-hero">
          <div>
            <p className="eyebrow">{ticket.number}</p>
            <h1>{ticket.problemType}</h1>
            <p>
              {ticket.machine.code} / {ticket.machine.name} / {ticket.plant}
            </p>
          </div>
          <b
            className={`ticket-status ticket-status--${ticket.status.toLowerCase()}`}
          >
            {label(ticket.status)}
          </b>
        </div>
        {ticket.sourceType && (
          <section className="source-card">
            <div>
              <span className="source-label">Source</span>
              <strong
                className={`source-badge source-badge--${ticket.sourceType.toLowerCase()}`}
              >
                {ticket.sourceType}
              </strong>
            </div>
            {ticket.sourceType === "QA" && ticket.sourceId && (
              <Link href={`/qa/defects/${ticket.sourceId}`}>
                View QA Defect {ticket.sourceId}
              </Link>
            )}
          </section>
        )}
        <section className="ticket-info-card">
          <h2>Ticket information</h2>
          <dl className="ticket-facts">
            <div>
              <dt>Machine</dt>
              <dd>
                {ticket.machine.code} / {ticket.machine.name}
              </dd>
            </div>
            <div>
              <dt>Location</dt>
              <dd>{ticket.location}</dd>
            </div>
            <div>
              <dt>Reporter</dt>
              <dd>{ticket.reporter?.name ?? "Provided by Laravel"}</dd>
            </div>
            <div>
              <dt>Priority</dt>
              <dd>
                <b
                  className={`priority-dot priority-dot--${ticket.priority.toLowerCase()}`}
                />
                {label(ticket.priority)}
              </dd>
            </div>
            <div>
              <dt>Created</dt>
              <dd>{ticket.createdAt}</dd>
            </div>
            <div>
              <dt>Assigned technician</dt>
              <dd>{ticket.technician?.name ?? "Unassigned"}</dd>
            </div>
          </dl>
          <div className="ticket-description">
            <dt>Description</dt>
            <p>{ticket.description}</p>
          </div>
        </section>
        {ticket.sla && (
          <section
            className={`sla-card sla-card--${ticket.sla.status.toLowerCase()}`}
          >
            <div>
              <span>SLA status</span>
              <strong>{label(ticket.sla.status)}</strong>
            </div>
            <div>
              <span>Target</span>
              <strong>{ticket.sla.targetAt ?? ticket.sla.dueAt ?? "--"}</strong>
            </div>
            <div>
              <span>Remaining</span>
              <strong>{ticket.sla.remaining ?? "--"}</strong>
            </div>
            <div>
              <span>Overdue duration</span>
              <strong>{ticket.sla.overdueDuration ?? "--"}</strong>
            </div>
          </section>
        )}
        <section className="ticket-info-card">
          <div className="detail-card__heading">
            <h2>Attachments</h2>
            <span>{ticket.attachments?.length ?? 0}</span>
          </div>
          {ticket.attachments?.length ? (
            <div className="attachment-list">
              {ticket.attachments.map((attachment) => (
                <a href={attachment.url} key={attachment.id}>
                  {attachment.name}
                </a>
              ))}
            </div>
          ) : (
            <EmptyState
              title="No attachments"
              description="Photos and documents will appear here when provided."
            />
          )}
        </section>
      </main>
      <aside className="ticket-actions">
        <Link className="back-link" href="/tickets">
          Back to tickets
        </Link>
        <section className="action-card">
          <p className="eyebrow">Technician actions</p>
          {isTechnician && (
            <>
              <label className="form-field">
                Status
                <select
                  value={ticketState}
                  onChange={(event) =>
                    setTicketState(event.target.value as "open" | "close")
                  }
                >
                  <option value="open">Open</option>
                  <option value="close">Close</option>
                </select>
              </label>
              {ticketState === "open" && (
                <label className="form-field">
                  Reason
                  <textarea
                    rows={3}
                    value={reason}
                    onChange={(event) => setReason(event.target.value)}
                    placeholder="Why is this ticket being opened?"
                  />
                </label>
              )}
              {ticketState === "close" && (
                <>
                  <label className="form-field">
                    Duration (hours)
                    <input
                      type="number"
                      min="0.25"
                      step="0.25"
                      value={durationHours}
                      onChange={(event) => setDurationHours(event.target.value)}
                      placeholder="How many hours"
                    />
                  </label>
                  <label className="form-field">
                    Solution
                    <textarea
                      rows={3}
                      value={solution}
                      onChange={(event) => setSolution(event.target.value)}
                      placeholder="What was the solution?"
                    />
                  </label>
                </>
              )}
              <button
                className="primary-button"
                disabled={
                  busy ||
                  (ticketState === "open"
                    ? !reason.trim()
                    : !durationHours || !solution.trim())
                }
                onClick={saveTicketState}
              >
                {busy
                  ? "Updating..."
                  : `Set ${ticketState === "open" ? "Open" : "Close"}`}
              </button>
            </>
          )}
          {isSupervisor && (
            <>
              <label className="form-field">
                Technician ID
                <input
                  value={technicianId}
                  onChange={(event) => setTechnicianId(event.target.value)}
                  placeholder="Laravel technician ID"
                />
              </label>
              <button
                className="secondary-action"
                disabled={!technicianId || busy}
                onClick={() => action("assign", { technicianId })}
              >
                Assign / Reassign Technician
              </button>
              <label className="form-field">
                Priority
                <select
                  value={priority}
                  onChange={(event) =>
                    setPriority(event.target.value as TicketPriority)
                  }
                >
                  {ticketPriorities.map((item) => (
                    <option key={item} value={item}>
                      {label(item)}
                    </option>
                  ))}
                </select>
              </label>
              <button
                className="secondary-action"
                disabled={busy}
                onClick={() => action("priority", { priority })}
              >
                Change Priority
              </button>
              {ticket.status === "RESOLVED" && (
                <>
                  <button
                    className="secondary-action"
                    onClick={() => action("review")}
                  >
                    Review Resolution
                  </button>
                  <button
                    className="primary-button"
                    onClick={() => action("verify")}
                  >
                    Verify Resolution
                  </button>
                </>
              )}
              {ticket.status === "VERIFIED" && (
                <button
                  className="secondary-action"
                  onClick={() => action("reopen")}
                >
                  Reopen Ticket
                </button>
              )}
            </>
          )}
          {!isTechnician && !isSupervisor && (
            <p className="action-note">
              Actions are available to technicians and supervisors according to
              Laravel authorization.
            </p>
          )}
          {actionError && (
            <ErrorState title="Action failed" description={actionError} />
          )}
        </section>
      </aside>
    </div>
  );
}
