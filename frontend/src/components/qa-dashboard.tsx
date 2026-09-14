'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getQADefects, qaApiMessage } from '@/lib/qa-api';
import { type QADefect, type QADefectSeverity, type QAMaintenanceFilter } from '@/lib/qa-types';
import { EmptyState, ErrorState, LoadingState } from './ui';

function label(value: string) { return value.replaceAll('-', ' ').replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase()); }

export function QADashboard() {
  const [defects, setDefects] = useState<QADefect[]>([]);
  const [filter, setFilter] = useState<QAMaintenanceFilter>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { let active = true; setLoading(true); getQADefects(1, filter).then((page) => { if (active) setDefects(page.data); }).catch((reason) => { if (active) setError(qaApiMessage(reason)); }).finally(() => { if (active) setLoading(false); }); return () => { active = false; }; }, [filter]);

  return <div className="qa-dashboard"><div className="qa-filters"><label>Maintenance status<select value={filter} onChange={(event) => setFilter(event.target.value as QAMaintenanceFilter)}><option value="all">All defects</option><option value="has-ticket">Has Maintenance Ticket</option><option value="no-ticket">No Maintenance Ticket</option><option value="open">Open</option><option value="in-progress">In Progress</option><option value="resolved">Resolved</option><option value="closed">Closed</option></select></label></div>{loading ? <LoadingState label="Loading QA defects" /> : error ? <ErrorState title="QA defects unavailable" description={error} /> : defects.length === 0 ? <EmptyState title="No QA defects found" description="No defects match the selected maintenance status." /> : <div className="qa-defect-table"><div className="qa-defect-head"><span>Defect</span><span>Machine / plant</span><span>Severity</span><span>Maintenance status</span></div>{defects.map((defect) => <Link key={defect.id} href={`/qa/defects/${defect.id}`} className="qa-defect-row"><span><strong>{defect.defectId}</strong><small>{defect.defectType}</small></span><span>{defect.machine.code}<small>{defect.plant}</small></span><span><b className={`priority-dot priority-dot--${(defect.severity as QADefectSeverity).toLowerCase()}`} />{label(defect.severity)}</span><span>{defect.maintenanceTicket ? <><b className="qa-ticket-link">{defect.maintenanceTicket.number}</b><small>{label(defect.maintenanceTicket.status)}</small></> : <span className="qa-no-ticket">No Maintenance Ticket</span>}</span></Link>)}</div>}</div>;
}
