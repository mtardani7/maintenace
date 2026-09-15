'use client';

import { CheckCircle2, ChevronLeft, ChevronRight, CircleOff, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { deleteMachine, getMachinePage, getPlantOptions, requestMachine, updateMachine } from '@/lib/maintenance-api';
import type { Machine, MachineStatus } from '@/lib/maintenance-types';
import { SectionHeading } from './ui';

const statusOptions: { value: MachineStatus | ''; label: string }[] = [
  { value: '', label: 'Semua status' },
  { value: 'running', label: 'Aktif' },
  { value: 'offline', label: 'Tidak aktif' },
];

type MachineForm = { plant_id: string; code: string; name: string; machine_number: string; description: string; is_active: boolean };
const emptyForm: MachineForm = { plant_id: '', code: '', name: '', machine_number: '', description: '', is_active: true };

function statusLabel(machine: Machine) { return machine.is_active === false ? 'Tidak aktif' : 'Aktif'; }

export function MachineList() {
  const [machines, setMachines] = useState<Machine[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const [pageInfo, setPageInfo] = useState({ current: 1, last: 1, total: 0 });
  const [search, setSearch] = useState('');
  const [plant, setPlant] = useState('');
  const [plantOptions, setPlantOptions] = useState<{ value: string; label: string }[]>([]);
  const [formPlants, setFormPlants] = useState<{ id: number; code: string; name: string }[]>([]);
  const [status, setStatus] = useState<MachineStatus | ''>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Machine | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Machine | null>(null);
  const [form, setForm] = useState<MachineForm>(emptyForm);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    setLoading(true);
    try { const result = await getMachinePage({ search: search.trim(), plant, status, page, per_page: pageSize }); setMachines(result.data); setPageInfo({ current: result.current_page, last: result.last_page, total: result.total }); setError(''); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Tidak dapat memuat mesin.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { void refresh(); }, [plant, search, status, page, pageSize]);
  useEffect(() => { getMachinePage({ page: 1, per_page: 100 }).then((result) => { const options = new Map<string, string>(); result.data.forEach((machine) => { if (machine.plant_id !== undefined) options.set(String(machine.plant_id), machine.plant); }); setPlantOptions(Array.from(options, ([value, label]) => ({ value, label })).sort((left, right) => left.label.localeCompare(right.label))); }).catch(() => setPlantOptions([])); getPlantOptions().then(setFormPlants).catch(() => setFormPlants([])); }, []);

  const plants = useMemo(() => plantOptions.length > 0 ? plantOptions : Array.from(new Map(machines.filter((machine) => machine.plant_id !== undefined).map((machine) => [String(machine.plant_id), machine.plant]),).entries(), ([value, label]) => ({ value, label })).sort((left, right) => left.label.localeCompare(right.label)), [machines, plantOptions]);
  function openCreate() { setEditing(null); setForm(emptyForm); setFormOpen(true); }
  function openEdit(machine: Machine) { setEditing(machine); setForm({ ...emptyForm, code: machine.code, name: machine.name, machine_number: machine.machine_number ?? '', description: machine.location, is_active: machine.is_active !== false }); setFormOpen(true); }
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setSaving(true); try { const payload = { ...form, plant_id: Number(form.plant_id) }; if (editing) await updateMachine(editing.id, payload); else await requestMachine(payload); setFormOpen(false); setPage(1); await refresh(); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Tidak dapat menyimpan mesin.'); } finally { setSaving(false); } }
  async function remove(machine: Machine) { setDeleteTarget(machine); }
  async function confirmRemove() { if (!deleteTarget) return; try { await deleteMachine(deleteTarget.id); setDeleteTarget(null); await refresh(); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Tidak dapat menghapus mesin.'); } }

  return <div className="machine-browser">
    <SectionHeading eyebrow="Daftar aset" title="Mesin" description="Kelola mesin yang ditugaskan ke pabrik." action={<div className="dashboard-header-actions"><button id="create-machine" type="button" className="primary-button" onClick={openCreate}><Plus aria-hidden="true" /> Tambah mesin</button></div>} />
    {formOpen && <div className="machine-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="machine-form-title"><form className="form-card machine-modal" onSubmit={submit}><div className="machine-request-header"><div><p className="eyebrow">Master data</p><h2 id="machine-form-title">{editing ? 'Edit machine' : 'Create machine'}</h2><p className="machine-modal-description">Maintain validated master data for the QMS.</p></div><button type="button" className="icon-button" onClick={() => setFormOpen(false)} aria-label="Close form"><X aria-hidden="true" /></button></div><div className="machine-request-grid"><label className="form-field">Plant<select required value={form.plant_id} onChange={(event) => setForm({ ...form, plant_id: event.target.value })}><option value="">Select plant</option>{formPlants.map((plantOption) => <option key={plantOption.id} value={plantOption.id}>{plantOption.code} — {plantOption.name}</option>)}</select></label><label className="form-field">Code<input required value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} /></label><label className="form-field">Item Name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label className="form-field">Machine Number<input required value={form.machine_number} onChange={(event) => setForm({ ...form, machine_number: event.target.value })} /></label><label className="form-field machine-form-description">Description<textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label><label className="form-field machine-checkbox"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} /> Active</label></div><div className="machine-modal-actions"><button className="secondary-action" type="button" onClick={() => setFormOpen(false)}>Cancel</button><button className="primary-button" type="submit" disabled={saving}>{saving ? 'Saving...' : editing ? 'Save changes' : 'Create machine'}</button></div></form></div>}
    {deleteTarget && <div className="machine-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="machine-delete-title"><div className="machine-modal machine-delete-modal"><div className="machine-request-header"><div><p className="eyebrow">Master data</p><h2 id="machine-delete-title">Delete machine?</h2></div><button type="button" className="icon-button" onClick={() => setDeleteTarget(null)} aria-label="Close delete dialog"><X aria-hidden="true" /></button></div><p>This action permanently deletes {deleteTarget.name}. This cannot be undone.</p><div className="machine-modal-actions"><button className="secondary-action" type="button" onClick={() => setDeleteTarget(null)}>Cancel</button><button className="danger-button" type="button" onClick={() => void confirmRemove()}>Delete</button></div></div></div>}
    <section className="machine-registry">
      <div className="machine-registry-header"><div><h2>Machines registry</h2><p>{pageInfo.total} records</p></div><div className="machine-table-filters"><label className="machine-search"><Search aria-hidden="true" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search machine..." /></label><select aria-label="Plant" value={plant} onChange={(event) => { setPlant(event.target.value); setPage(1); }}><option value="">All plants</option>{plants.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select><select aria-label="Status" value={status} onChange={(event) => { setStatus(event.target.value as MachineStatus | ''); setPage(1); }}>{statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select><select aria-label="Rows per page" value={pageSize} onChange={(event) => { setPageSize(Number(event.target.value)); setPage(1); }}><option value="20">20 / page</option><option value="50">50 / page</option><option value="100">100 / page</option></select></div></div>
      {loading ? <div className="machine-table-loading" aria-label="Loading machines">{[1, 2, 3, 4].map((row) => <div className="machine-table-skeleton" key={row} />)}</div> : error ? <p className="machine-table-message machine-table-message--error">Unable to load machines.</p> : machines.length === 0 ? <p className="machine-table-message">No records match the selected filters.</p> : <><div className="machine-table-scroll"><table className="machine-data-table"><thead><tr><th>Machine No.</th><th>Code</th><th>Name</th><th>Plant</th><th>Status</th><th className="machine-actions-heading">Actions</th></tr></thead><tbody>{machines.map((machine) => <tr key={machine.id}><td><Link href={`/machines/${machine.id}`}>{machine.machine_number || '—'}</Link></td><td><Link href={`/machines/${machine.id}`}>{machine.code}</Link></td><td><Link href={`/machines/${machine.id}`}><strong>{machine.name}</strong></Link></td><td>{machine.plant || '—'}</td><td><span className={`machine-status ${machine.is_active === false ? 'machine-status--inactive' : 'machine-status--active'}`}>{machine.is_active === false ? <CircleOff aria-hidden="true" /> : <CheckCircle2 aria-hidden="true" />}{statusLabel(machine)}</span></td><td><div className="machine-actions"><button type="button" onClick={() => openEdit(machine)} aria-label={`Edit ${machine.name}`}><Pencil aria-hidden="true" /></button><button type="button" onClick={() => void remove(machine)} aria-label={`Delete ${machine.name}`}><Trash2 aria-hidden="true" /></button></div></td></tr>)}</tbody></table></div><div className="machine-pagination"><p>Page {pageInfo.current} of {pageInfo.last}</p><div><button type="button" disabled={pageInfo.current <= 1} onClick={() => setPage((value) => value - 1)}><ChevronLeft aria-hidden="true" /> Previous</button><button type="button" disabled={pageInfo.current >= pageInfo.last} onClick={() => setPage((value) => value + 1)}>Next <ChevronRight aria-hidden="true" /></button></div></div></>}
    </section>
  </div>;
}
