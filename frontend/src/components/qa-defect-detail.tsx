'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { createMaintenanceTicketFromDefect, getQADefect, getQADefectMaintenanceTicket, qaApiMessage } from '@/lib/qa-api';
import type { QADefect } from '@/lib/qa-types';
import type { Ticket } from '@/lib/ticket-types';
import { ErrorState, LoadingState } from './ui';

function label(value: string) { return value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()); }

export function QADefectDetail({ defectId }: { defectId: string }) {
  const [defect, setDefect] = useState<QADefect | null>(null);
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [checking, setChecking] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => { getQADefect(defectId).then((result) => { setDefect(result); return getQADefectMaintenanceTicket(result.id); }).then((result) => setTicket(result)).catch((reason) => setError(qaApiMessage(reason))).finally(() => setChecking(false)); }, [defectId]);
  if (error) return <ErrorState title="QA defect unavailable" description={error} />;
  if (!defect || checking) return <LoadingState label="Loading QA defect" />;

  async function createTicket() { setBusy(true); setError(''); try { const created = await createMaintenanceTicketFromDefect(defect!); setTicket(created); setSuccess('Maintenance ticket created from this QA defect.'); } catch (reason) { setError(qaApiMessage(reason)); } finally { setBusy(false); } }

  return <div className="qa-detail-layout"><main><div className="qa-detail-hero"><div><p className="eyebrow">QA DEFECT / {defect.defectId}</p><h1>{defect.defectType}</h1><p>{defect.machine.code} / {defect.machine.name} / {defect.plant}</p></div><span className={`qa-severity qa-severity--${defect.severity.toLowerCase()}`}>{label(defect.severity)}</span></div><section className="detail-card"><h2>Defect information</h2><dl className="machine-facts"><div><dt>Defect ID</dt><dd>{defect.defectId}</dd></div><div><dt>Machine</dt><dd>{defect.machine.code} / {defect.machine.name}</dd></div><div><dt>Plant</dt><dd>{defect.plant}</dd></div><div><dt>Inspection date</dt><dd>{defect.inspectionDate}</dd></div><div><dt>Quantity</dt><dd>{defect.quantity}</dd></div><div><dt>QA inspector</dt><dd>{defect.inspector.name}</dd></div></dl><div className="ticket-description"><dt>Description</dt><p>{defect.description}</p></div></section></main><aside className="qa-detail-aside"><section className="action-card"><p className="eyebrow">Maintenance link</p>{ticket ? <><h2>Maintenance Ticket</h2><strong className="qa-ticket-number">{ticket.number}</strong><p>Status: <b className={`ticket-status ticket-status--${ticket.status.toLowerCase()}`}>{label(ticket.status)}</b></p><Link className="primary-button primary-button--link" href={`/tickets/${ticket.id}`}>Open Maintenance Ticket</Link></> : <><h2>No ticket yet</h2><p>Create one from the QA defect. Machine, severity, problem, and description are carried forward automatically.</p><button className="primary-button" disabled={busy} onClick={createTicket}>{busy ? 'Creating...' : 'Create Maintenance Ticket'}</button></>}{success && <p className="qa-success">{success}</p>}{error && <ErrorState title="Ticket not created" description={error} />}</section><Link className="back-link" href="/qa">Back to QA dashboard</Link></aside></div>;
}
