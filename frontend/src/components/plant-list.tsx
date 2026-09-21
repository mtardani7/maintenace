'use client';

import { CheckCircle2, ChevronLeft, ChevronRight, CircleOff, Pencil, Plus, Search, Trash2, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { deactivatePlant, createPlant, getPlants, updatePlant } from '@/lib/maintenance-api';
import { getCurrentUser } from '@/lib/auth';
import type { Plant } from '@/lib/maintenance-types';
import { EmptyState, ErrorState, LoadingState, SectionHeading } from './ui';

type FormState = { code: string; name: string; description: string; is_active: boolean };
const emptyForm: FormState = { code: '', name: '', description: '', is_active: true };

export function PlantList() {
  const [plants, setPlants] = useState<Plant[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [page, setPage] = useState(1);
  const [pageInfo, setPageInfo] = useState({ current: 1, last: 1, total: 0 });
  const [role, setRole] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Plant | null>(null);
  const [target, setTarget] = useState<Plant | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  async function refresh() {
    setLoading(true);
    try { const result = await getPlants({ search, is_active: status, page, per_page: 20 }); setPlants(result.data); setPageInfo({ current: result.current_page, last: result.last_page, total: result.total }); setError(''); }
    catch (reason) { setError(reason instanceof Error ? reason.message : 'Tidak dapat memuat Plant.'); }
    finally { setLoading(false); }
  }
  useEffect(() => { getCurrentUser().then((result) => setRole(result.status === 'authenticated' ? result.user.role ?? null : null)); }, []);
  useEffect(() => { if (role === 'admin') void refresh(); else if (role !== null) setLoading(false); }, [role, search, status, page]);
  function openCreate() { setEditing(null); setForm(emptyForm); setFormOpen(true); }
  function openEdit(plant: Plant) { setEditing(plant); setForm({ code: plant.code, name: plant.name, description: plant.description ?? '', is_active: plant.is_active }); setFormOpen(true); }
  async function submit(event: React.FormEvent<HTMLFormElement>) { event.preventDefault(); setSaving(true); try { if (editing) await updatePlant(editing.id, form); else await createPlant(form); setFormOpen(false); setPage(1); await refresh(); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Plant tidak dapat disimpan.'); } finally { setSaving(false); } }
  async function confirmDelete() { if (!target) return; try { await deactivatePlant(target.id); setTarget(null); await refresh(); } catch (reason) { setError(reason instanceof Error ? reason.message : 'Plant tidak dapat dinonaktifkan.'); } }

  if (role === null || loading && role === null) return <LoadingState label="Memeriksa akses Plant" />;
  if (role !== 'admin') return <ErrorState title="Akses Admin diperlukan" description="Master Plant hanya dapat dikelola oleh Admin." />;

  return <div className="plant-browser">
    <SectionHeading eyebrow="Daftar aset" title="Plant" description="Kelola master Plant Maintenance secara lokal." action={<div className="dashboard-header-actions"><button className="primary-button" type="button" onClick={openCreate}><Plus aria-hidden="true" /> Tambah Plant</button></div>} />
    {formOpen && <div className="plant-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="plant-form-title"><form className="plant-modal" onSubmit={submit}><div className="plant-modal__header"><div><p className="eyebrow">Master data</p><h2 id="plant-form-title">{editing ? 'Edit Plant' : 'Create Plant'}</h2></div><button className="icon-button" type="button" onClick={() => setFormOpen(false)} aria-label="Close form"><X aria-hidden="true" /></button></div><label className="form-field">Code<input required value={form.code} onChange={(event) => setForm({ ...form, code: event.target.value })} /></label><label className="form-field">Name<input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} /></label><label className="form-field">Description<textarea rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} /></label><label className="plant-active-field"><input type="checkbox" checked={form.is_active} onChange={(event) => setForm({ ...form, is_active: event.target.checked })} /> Active</label><div className="plant-modal__actions"><button className="secondary-action" type="button" onClick={() => setFormOpen(false)}>Cancel</button><button className="primary-button" type="submit" disabled={saving}>{saving ? 'Saving...' : 'Save Plant'}</button></div></form></div>}
    {target && <div className="plant-modal-backdrop" role="dialog" aria-modal="true" aria-labelledby="plant-delete-title"><div className="plant-modal"><div className="plant-modal__header"><div><p className="eyebrow">Confirmation</p><h2 id="plant-delete-title">Deactivate Plant?</h2></div><button className="icon-button" type="button" onClick={() => setTarget(null)} aria-label="Close confirmation"><X aria-hidden="true" /></button></div><p>Plant akan dinonaktifkan. Data Machine dan history tetap dipertahankan.</p><div className="plant-modal__actions"><button className="secondary-action" type="button" onClick={() => setTarget(null)}>Cancel</button><button className="danger-button" type="button" onClick={() => void confirmDelete()}>Deactivate</button></div></div></div>}
    <section className="plant-registry"><div className="machine-registry-header"><div><h2>Plants registry</h2><p>{pageInfo.total} records</p></div><div className="machine-table-filters"><label className="machine-search"><Search aria-hidden="true" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search plant..." /></label><select aria-label="Status" value={status} onChange={(event) => { setStatus(event.target.value); setPage(1); }}><option value="">All status</option><option value="true">Active</option><option value="false">Inactive</option></select></div></div>{loading ? <LoadingState label="Memuat Plant" /> : error ? <ErrorState title="Plant tidak tersedia" description={error} /> : plants.length === 0 ? <EmptyState title="Belum ada Plant" description="Tidak ada Plant yang sesuai dengan filter." /> : <><div className="plant-table-scroll"><table className="plant-table"><thead><tr><th>Code</th><th>Name</th><th>Description</th><th>Status</th><th>Updated</th><th>Actions</th></tr></thead><tbody>{plants.map((plant) => <tr key={plant.id}><td><strong>{plant.code}</strong></td><td>{plant.name}</td><td>{plant.description || '—'}</td><td><span className={`plant-status ${plant.is_active ? 'plant-status--active' : 'plant-status--inactive'}`}>{plant.is_active ? <CheckCircle2 aria-hidden="true" /> : <CircleOff aria-hidden="true" />}{plant.is_active ? 'Aktif' : 'Tidak aktif'}</span></td><td>{plant.updated_at ? new Date(plant.updated_at).toLocaleDateString('id-ID') : '—'}</td><td><button className="plant-icon-button" type="button" onClick={() => openEdit(plant)} aria-label={`Edit ${plant.name}`}><Pencil aria-hidden="true" /></button><button className="plant-icon-button plant-icon-button--danger" type="button" onClick={() => setTarget(plant)} aria-label={`Deactivate ${plant.name}`}><Trash2 aria-hidden="true" /></button></td></tr>)}</tbody></table></div><div className="plant-pagination"><p>Page {pageInfo.current} of {pageInfo.last}</p><div><button className="secondary-action" disabled={pageInfo.current <= 1} onClick={() => setPage(pageInfo.current - 1)}><ChevronLeft aria-hidden="true" /> Previous</button><button className="secondary-action" disabled={pageInfo.current >= pageInfo.last} onClick={() => setPage(pageInfo.current + 1)}>Next <ChevronRight aria-hidden="true" /></button></div></div></>}</section>
  </div>;
}
