'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getAttentionTickets, getOperationalStats, operationsApiMessage } from '@/lib/operations-api';
import type { AttentionTicket, OperationalStats, OperationsFilters } from '@/lib/operations-types';
import { ticketPriorities, ticketStatuses, type TicketPriority, type TicketStatus } from '@/lib/ticket-types';
import { EmptyState, ErrorState, LoadingState } from './ui';

function label(value: string) { return value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()); }
const metricLabels: { key: keyof OperationalStats; label: string }[] = [{ key: 'open', label: 'Open Tickets' }, { key: 'unassigned', label: 'Unassigned' }, { key: 'assigned', label: 'Assigned' }, { key: 'inProgress', label: 'In Progress' }, { key: 'overdue', label: 'Overdue' }, { key: 'resolvedToday', label: 'Resolved Today' }, { key: 'closedToday', label: 'Closed Today' }];

export function OperationsDashboard() {
  const [filters, setFilters] = useState<OperationsFilters>({});
  const [stats, setStats] = useState<OperationalStats | null>(null);
  const [attention, setAttention] = useState<AttentionTicket[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  useEffect(() => { let active = true; setLoading(true); Promise.all([getOperationalStats(filters), getAttentionTickets(filters)]).then(([nextStats, nextAttention]) => { if (active) { setStats(nextStats); setAttention(nextAttention); setError(''); } }).catch((reason) => { if (active) setError(operationsApiMessage(reason)); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [filters]);
  function update(key: keyof OperationsFilters, value: string) { setFilters((current) => ({ ...current, [key]: value })); }
  return <div className="operations-dashboard"><div className="operations-filters"><label>Plant<input value={filters.plant ?? ''} onChange={(event) => update('plant', event.target.value)} placeholder="All plants" /></label><label>Priority<select value={filters.priority ?? ''} onChange={(event) => update('priority', event.target.value as TicketPriority | '')}><option value="">All priorities</option>{ticketPriorities.map((item) => <option key={item} value={item}>{label(item)}</option>)}</select></label><label>Status<select value={filters.status ?? ''} onChange={(event) => update('status', event.target.value as TicketStatus | '')}><option value="">All statuses</option>{ticketStatuses.map((item) => <option key={item} value={item}>{label(item)}</option>)}</select></label><label>Date<input type="date" value={filters.date ?? ''} onChange={(event) => update('date', event.target.value)} /></label></div>{loading ? <LoadingState label="Loading operational dashboard" /> : error ? <ErrorState title="Operations data unavailable" description={error} /> : <>{stats && <div className="metric-grid operations-metrics">{metricLabels.map((metric) => <article className={`metric-card ${metric.key === 'overdue' ? 'metric-card--critical' : ''}`} key={metric.key}><span className="metric-card__label">{metric.label}</span><strong className="metric-card__value">{stats[metric.key]}</strong><span className="metric-card__status">Laravel source</span></article>)}</div>}<section className="work-panel attention-panel"><div className="work-panel__header"><h3>Critical and overdue attention</h3><span>PRIORITY QUEUE</span></div>{attention.length ? <div className="attention-list">{attention.map((ticket) => <Link href={`/tickets/${ticket.id}`} key={ticket.id}><span><strong>{ticket.number}</strong><small>{ticket.machine} / {ticket.problem}</small></span><b className={`ticket-status ticket-status--${ticket.status.toLowerCase()}`}>{label(ticket.status)}</b><em className={ticket.sla?.status === 'OVERDUE' ? 'sla-overdue' : ''}>{label(ticket.sla?.status ?? 'unknown')}</em></Link>)}</div> : <EmptyState title="No priority tickets" description="The Laravel attention queue has no records for these filters." />}</section></>}</div>;
}
