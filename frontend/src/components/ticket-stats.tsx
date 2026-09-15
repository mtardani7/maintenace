'use client';

import { useEffect, useState } from 'react';
import { apiMessage, getTicketStats, type TicketStats } from '@/lib/ticket-api';
import { ErrorState, LoadingState } from './ui';

const metrics: { key: keyof TicketStats; label: string }[] = [
  { key: 'open', label: 'Terbuka' },
  { key: 'unassigned', label: 'Belum ditugaskan' },
  { key: 'assigned', label: 'Ditugaskan' },
  { key: 'inProgress', label: 'Sedang dikerjakan' },
  { key: 'overdue', label: 'Terlambat' },
  { key: 'resolvedToday', label: 'Selesai hari ini' },
];

export function TicketStatsCards() {
  const [stats, setStats] = useState<TicketStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => { getTicketStats().then(setStats).catch((reason) => setError(apiMessage(reason))); }, []);
  if (error) return <ErrorState title="Statistik tiket tidak tersedia" description={error} />;
  if (!stats) return <LoadingState label="Memuat statistik tiket" />;
  return <div className="metric-grid ticket-stats-grid">{metrics.map((metric) => <article className="metric-card" key={metric.key}><span className="metric-card__label">{metric.label}</span><strong className="metric-card__value">{stats[metric.key]}</strong><span className="metric-card__status">From Laravel</span></article>)}</div>;
}