'use client';

import { useEffect, useState } from 'react';
import { apiMessage, getTicketStats, type TicketStats } from '@/lib/ticket-api';
import { ErrorState, LoadingState } from './ui';

const metrics: { key: keyof TicketStats; label: string }[] = [
  { key: 'open', label: 'Open' },
  { key: 'unassigned', label: 'Unassigned' },
  { key: 'assigned', label: 'Assigned' },
  { key: 'inProgress', label: 'In Progress' },
  { key: 'overdue', label: 'Overdue' },
  { key: 'resolvedToday', label: 'Resolved Today' },
];

export function TicketStatsCards() {
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => { getTicketStats().then(setStats).catch((reason) => setError(apiMessage(reason))); }, []);
  if (error) return <ErrorState title="Ticket statistics unavailable" description={error} />;
  if (!stats) return <LoadingState label="Loading ticket statistics" />;
  return <div className="metric-grid ticket-stats-grid">{metrics.map((metric) => <article className="metric-card" key={metric.key}><span className="metric-card__label">{metric.label}</span><strong className="metric-card__value">{stats[metric.key]}</strong><span className="metric-card__status">From Laravel</span></article>)}</div>;
}