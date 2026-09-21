'use client';

import { CheckCircle2, ChevronLeft, ChevronRight, CircleOff, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { deleteMachine, getMachinePage, requestMachine, updateMachine } from '@/lib/maintenance-api';
import type { Machine } from '@/lib/maintenance-types';
import { SectionHeading } from './ui';

type MachineForm = { plant_id: string; code: string; name: string; section: string; is_active: boolean };
const emptyForm: MachineForm = { plant_id: '', code: '', name: '', section: '', is_active: true };

export function MachineList() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [pageInfo, setPageInfo] = useState({ current: 1, last: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [plant, setPlant] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Machine | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Machine | null>(null);
  const [form, setForm] = useState<MachineForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const result = await getMachinePage({ search: search.trim(), plant, status, page, per_page: pageSize });
      setMachines(result.data); setPageInfo({ current: result.current_page, last: result.last_page, total: result.total }); setError('');
    } catch (reason) { setError(reason instanceof Error ? reason.message : 'Tidak dapat memuat mesin.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { void refresh(); }, [plant, search, status, page, pageSize]);
  function openCreate() { setEditing(null); setForm(emptyForm); setFormOpen(true); }
  function openEdit(machine: Machine) { setEditing(machine); setForm({ plant_id: String(machine.plant_id), code: machine.code, name: machine.name, section: machine.section ?? '', is_active: machine.is_active }); setFormOpen(true); }
  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true);
    try { const payload = { ...form, plant_id: Number(form.plant_id) }; if (editing) await updateMachine(editing.id, payload); else await requestMachine(payload); setFormOpen(false); setPage(1); await refresh(); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Tidak dapat menyimpan mesin.'); }
    finally { setSaving(false); }
  }
  async function confirmRemove() { if (!deleteTarget) return; try { await deleteMachine(deleteTarget.id); setDeleteTarget(null); await refresh(); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Tidak dapat menonaktifkan mesin.'); } }

  return <div className="machine-browser">
    <SectionHeading eyebrow="Daftar aset" title="Mesin" description="Kelola master machine Maintenance secara lokal." action={<div className="dashboard-header-actions"><button id="create-machine" type="button" className="primary-button" onClick={openCreate}><Plus aria-hidden="true" /> Tambah mesin</button></div>} />
    {formOpen && <div className="machine-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="machine-form-title"><form className="form-card machine-modal" onSubmit={submit}><div className="machine-request-header"><div><p className="eyebrow">Master data</p><h2 id="machine-form-title">{editing ? 'Edit machine' : 'Create machine'}</h2><p className="machine-modal-description">Data ini dikelola oleh Maintenance Database.</p></div><button type="button" className="icon-button" onClick={() => setFormOpen(false)} aria-label="Close form"><X aria-hidden="true" /></button></div><div className="machine-request-grid"><label className="form-field">Plant ID<input required type="number" min="1" value={form.plant_id} onChange={(event) => setForm({ ...form, plant_id: event.target.value })} /></label><label className="form-field">Code<input required value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} /></label><label className="form-field">Name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label className="form-field">Section<input value={form.section} onChange={(event) => setForm({ ...form, section: event.target.value })} /></label><label className="form-field machine-checkbox"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} /> Active</label></div><div className="machine-modal-actions"><button className="secondary-action" type="button" onClick={() => setFormOpen(false)}>Cancel</button><button className="primary-button" type="submit" disabled={saving}>{saving ? 'Saving...' : editing ? 'Save changes' : 'Create machine'}</button></div></form></div>}
    {deleteTarget && <div className="machine-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="machine-delete-title"><div className="machine-modal machine-delete-modal"><div className="machine-request-header"><div><p className="eyebrow">Master data</p><h2 id="machine-delete-title">Deactivate machine?</h2></div><button type="button" className="icon-button" onClick={() => setDeleteTarget(null)} aria-label="Close dialog"><X aria-hidden="true" /></button></div><p>Machine akan menjadi tidak aktif. Data Incident dan Ticket tetap aman.</p><div className="machine-modal-actions"><button className="secondary-action" type="button" onClick={() => setDeleteTarget(null)}>Cancel</button><button className="danger-button" type="button" onClick={() => void confirmRemove()}>Deactivate</button></div></div></div>}
    <section className="machine-registry"><div className="machine-registry-header"><div><h2>Machines registry</h2><p>{pageInfo.total} records</p></div><div className="machine-table-filters"><label className="machine-search"><Search aria-hidden="true" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search machine..." /></label><input aria-label="Plant ID" value={plant} onChange={(event) => { setPlant(event.target.value); setPage(1); }} placeholder="Plant ID" /><select aria-label="Status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">All status</option><option value="running">Active</option><option value="offline">Inactive</option></select><select aria-label="Rows per page" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}><option value="20">20 / page</option><option value="50">50 / page</option><option value="100">100 / page</option></select></div></div>{loading ? <div className="machine-table-loading" aria-label="Loading machines">{[1, 2, 3, 4].map((row) => <div className="machine-table-skeleton" key={row} />)}</div> : error ? <p className="machine-table-message machine-table-message--error">Unable to load machines.</p> : machines.length === 0 ? <p className="machine-table-message">No records match the selected filters.</p> : <><div className="machine-table-scroll"><table className="machine-data-table"><thead><tr><th>Code</th><th>Name</th><th>Plant ID</th><th>Section</th><th>Status</th><th className="machine-actions-heading">Actions</th></tr></thead><tbody>{machines.map((machine) => <tr key={machine.id}><td><Link href={`/machines/${machine.id}`}>{machine.code}</Link></td><td><Link href={`/machines/${machine.id}`}><strong>{machine.name}</strong></Link></td><td>{machine.plant_id}</td><td>{machine.section || '—'}</td><td><span className={`machine-status ${machine.is_active ? 'machine-status--active' : 'machine-status--inactive'}`}>{machine.is_active ? <CheckCircle2 aria-hidden="true" /> : <CircleOff aria-hidden="true" />}{machine.is_active ? 'Aktif' : 'Tidak aktif'}</span></td><td><div className="machine-actions"><button type="button" onClick={() => openEdit(machine)} aria-label={`Edit ${machine.name}`}><Pencil aria-hidden="true" /></button><button type="button" onClick={() => setDeleteTarget(machine)} aria-label={`Deactivate ${machine.name}`}><Trash2 aria-hidden="true" /></button></div></td></tr>)}</tbody></table></div><div className="machine-pagination"><p>Page {pageInfo.current} of {pageInfo.last}</p><div><button type="button" disabled={pageInfo.current <= 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft aria-hidden="true" /> Previous</button><button type="button" disabled={pageInfo.current >= pageInfo.last} onClick={() => setPage((value) => value + 1)}>Next <ChevronRight aria-hidden="true" /></button></div></div></>}</section>
  </div>;
}
