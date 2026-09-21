"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { apiMessage, getTicket, performTicketAction } from "@/lib/ticket-api";
import {
  type Ticket,
  type TicketActionInput,
} from "@/lib/ticket-types";
import { EmptyState, ErrorState, LoadingState } from "./ui";

function label(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}
export function TicketDetailView({ ticketId }: { ticketId: string }) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [error, setError] = useState("");
  const [actionError, setActionError] = useState("");
  const [busy, setBusy] = useState(false);
  const [durationHours, setDurationHours] = useState("");
  const [solution, setSolution] = useState("");
  useEffect(() => {
    getTicket(ticketId)
      .then(setTicket)
      .catch((reason) => setError(apiMessage(reason)));
  }, [ticketId]);
  if (error)
    return <ErrorState title="Tiket tidak tersedia" description={error} />;
  if (!ticket) return <LoadingState label="Memuat tiket" />;
  function closeTicket() {
    if (!durationHours || Number(durationHours) <= 0) {
      setActionError("Duration is required when closing a ticket.");
      return;
    }
    if (!solution.trim()) {
      setActionError("Solution is required when closing a ticket.");
      return;
    }
    action("close", {
      durationHours: Number(durationHours),
      solution: solution.trim(),
    });
  }
  async function action(
    actionType: "close",
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
          <p className="eyebrow">Maintenance workflow</p>
          {ticket.status === "OPEN" ? (
            <>
              <p className="action-note">Lengkapi durasi pekerjaan dan solusi untuk menutup tiket.</p>
              <label className="form-field">
                Duration (hours)
                <input
                  type="number"
                  min="0.25"
                  step="0.25"
                  value={durationHours}
                  onChange={(event) => setDurationHours(event.target.value)}
                  placeholder="Contoh: 2.5"
                />
              </label>
              <label className="form-field">
                Solution
                <textarea
                  rows={4}
                  value={solution}
                  onChange={(event) => setSolution(event.target.value)}
                  placeholder="Jelaskan solusi atau tindakan perbaikan"
                />
              </label>
              <button
                className="primary-button"
                disabled={busy || !durationHours || !solution.trim()}
                onClick={closeTicket}
              >
                {busy ? "Saving..." : "Close Ticket"}
              </button>
            </>
          ) : (
            <>
              <p className="action-note">Tiket sudah ditutup dan tersimpan sebagai riwayat maintenance.</p>
              <dl className="ticket-facts">
                <div>
                  <dt>Duration</dt>
                  <dd>{ticket.durationHours ?? "--"} hours</dd>
                </div>
                <div>
                  <dt>Solution</dt>
                  <dd>{ticket.solution ?? "--"}</dd>
                </div>
              </dl>
            </>
          )}
          {actionError && (
            <ErrorState title="Action failed" description={actionError} />
          )}
        </section>
      </aside>
    </div>
  );
}
