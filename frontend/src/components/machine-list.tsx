'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { getMachines } from '@/lib/maintenance-api';
import type { Machine, MachineStatus } from '@/lib/maintenance-types';
import { EmptyState, ErrorState, LoadingState } from './ui';

const statusOptions: { value: MachineStatus | ''; label: string }[] = [
  { value: '', label: 'All statuses' },
  { value: 'running', label: 'Running' },
  { value: 'stopped', label: 'Stopped' },
  { value: 'maintenance', label: 'Maintenance' },
  { value: 'offline', label: 'Offline' },
];

function statusLabel(status: MachineStatus) {
  return status.charAt(0).toUpperCase() + status.slice(1);
}

export function MachineList() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [search, setSearch] = useState('');
  const [plant, setPlant] = useState('');
  const [status, setStatus] = useState<MachineStatus | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let active = true;
    setLoading(true);
    getMachines({ search: search.trim(), plant, status })
      .then((result) => { if (active) { setMachines(result); setError(''); } })
      .catch((reason: unknown) => { if (active) setError(reason instanceof Error ? reason.message : 'Unable to load machines.'); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [plant, search, status]);

  const plants = useMemo(() => Array.from(new Set(machines.map((machine) => machine.plant))).sort(), [machines]);

  return <div className="machine-browser">
    <div className="filter-bar">
      <label className="filter-search">Search machines<input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Code or machine name" /></label>
      <label>Plant<select value={plant} onChange={(event) => setPlant(event.target.value)}><option value="">All plants</option>{plants.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
      <label>Status<select value={status} onChange={(event) => setStatus(event.target.value as MachineStatus | '')}>{statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>
    </div>
    {loading ? <LoadingState label="Loading machines" /> : error ? <ErrorState title="Machine list unavailable" description={error} /> : machines.length === 0 ? <EmptyState title="No machines found" description="No machine data is available for the current filters." /> : <div className="machine-table" role="table" aria-label="Machine list">
      <div className="machine-table__head" role="row"><span>Machine</span><span>Plant / line</span><span>Location</span><span>Status</span></div>
      {machines.map((machine) => <Link className="machine-row" role="row" href={`/machines/${machine.id}`} key={machine.id}><span><strong>{machine.code}</strong><small>{machine.name}</small></span><span>{machine.plant}<small>{machine.line}</small></span><span>{machine.location}</span><span><i className={`status-pill status-pill--${machine.status}`} />{statusLabel(machine.status)}</span></Link>)}
    </div>}
  </div>;
}
