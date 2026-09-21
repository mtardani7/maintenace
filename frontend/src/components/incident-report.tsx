'use client';

import { useEffect, useMemo, useState } from 'react';
import { createIncident, getIncidents, getMachines, getPlantOptions, type PlantOption } from '@/lib/maintenance-api';
import type { Incident, Machine } from '@/lib/maintenance-types';
import { EmptyState, ErrorState, LoadingState } from './ui';

const problemTypes = [
  { value: 'Machine stopped', label: 'Mesin berhenti' },
  { value: 'Abnormal sound', label: 'Suara tidak normal' },
  { value: 'Sensor problem', label: 'Masalah sensor' },
  { value: 'Quality problem', label: 'Masalah mutu' },
  { value: 'Other', label: 'Lainnya' },
] as const;

type Resolution = 'resolved' | 'cannot-resolve' | '';

export function IncidentReport() {
  const [plants, setPlants] = useState<PlantOption[]>([]);
  const [machines, setMachines] = useState<Machine[]>([]);
  const [machineDirectory, setMachineDirectory] = useState<Machine[]>([]);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [plantId, setPlantId] = useState('');
  const [machineId, setMachineId] = useState('');
  const [problemType, setProblemType] = useState('');
  const [description, setDescription] = useState('');
  const [resolution, setResolution] = useState<Resolution>('');
  const [actionTaken, setActionTaken] = useState('');
  const [result, setResult] = useState('');
  const [plantsLoading, setPlantsLoading] = useState(true);
  const [machinesLoading, setMachinesLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [touched, setTouched] = useState(false);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState('');

  async function refreshHistory() {
    setHistoryLoading(true);
    try {
      setIncidents(await getIncidents());
      setHistoryError('');
    } catch (reason) {
      setHistoryError(reason instanceof Error ? reason.message : 'Riwayat insiden tidak dapat dimuat.');
    } finally {
      setHistoryLoading(false);
    }
  }

  useEffect(() => {
    getPlantOptions()
      .then(setPlants)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Tidak dapat memuat daftar plant.'))
      .finally(() => setPlantsLoading(false));
    getMachines({ page: 1, per_page: 100 }).then(setMachineDirectory).catch(() => setMachineDirectory([]));
  }, []);

  useEffect(() => { void refreshHistory(); }, []);

  useEffect(() => {
    setMachineId('');
    setMachines([]);
    if (!plantId) return;
    setMachinesLoading(true);
    setError('');
    getMachines({ plant: plantId, page: 1, per_page: 100 })
      .then(setMachines)
      .catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Tidak dapat memuat mesin pada plant ini.'))
      .finally(() => setMachinesLoading(false));
  }, [plantId]);

  const selectedPlant = useMemo(() => plants.find((plant) => String(plant.id) === plantId), [plantId, plants]);
  const visibleIncidents = useMemo(() => incidents.filter((incident) => {
    if (plantId && String(incident.plantId) !== plantId) return false;
    if (machineId && String(incident.machineId) !== machineId) return false;
    return true;
  }), [incidents, machineId, plantId]);

  function validate() {
    if (!plantId) return 'Pilih plant terlebih dahulu.';
    if (!machineId) return 'Pilih mesin terlebih dahulu.';
    if (!problemType) return 'Pilih jenis masalah.';
    if (description.trim().length < 10) return 'Jelaskan masalah minimal 10 karakter.';
    if (!resolution) return 'Pilih apakah masalah dapat diselesaikan operator.';
    if (resolution === 'resolved' && actionTaken.trim().length < 5) return 'Jelaskan tindakan operator minimal 5 karakter.';
    if (resolution === 'resolved' && result.trim().length < 5) return 'Jelaskan hasil tindakan minimal 5 karakter.';
    return '';
  }

  async function submitReport() {
    setTouched(true);
    const validationError = validate();
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      if (resolution === 'resolved') {
        await createIncident({ plantId, machineId, problemType, description: description.trim(), actionTaken: actionTaken.trim(), result: result.trim(), status: 'RESOLVED' });
        setSuccess('Catatan insiden berhasil dibuat. Tidak ada tiket pemeliharaan yang dibuka.');
        await refreshHistory();
      } else {
        await createIncident({ plantId, machineId, problemType, description: description.trim(), status: 'OPEN' });
        setSuccess('Tiket pemeliharaan berhasil dibuat dan diteruskan ke tim.');
        await refreshHistory();
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'Laporan tidak dapat disimpan. Periksa koneksi API lalu coba lagi.');
    } finally {
      setSubmitting(false);
    }
  }

  if (plantsLoading) return <LoadingState label="Memuat daftar plant" />;
  if (!plants.length && !error) return <EmptyState title="Tidak ada plant tersedia" description="Plant belum tersedia dari API. Hubungi administrator sistem." />;

  const validationError = touched ? validate() : '';
  const selectedMachine = machines.find((machine) => String(machine.id) === machineId);

  return <>
  {success && <div className="success-panel incident-success"><span className="success-mark">OK</span><div><strong>{success}</strong><p>Laporan tersimpan dan riwayat sudah diperbarui.</p></div><button className="icon-button" type="button" onClick={() => setSuccess('')} aria-label="Tutup pesan">×</button></div>}
  <div className="report-layout">
    <div className="report-main">
      <div className="stepper"><span className="stepper__active">01 Plant & Mesin</span><span className={plantId && machineId ? 'stepper__active' : ''}>02 Masalah</span><span className={resolution ? 'stepper__active' : ''}>03 Penyelesaian</span></div>
      <section className="form-card">
        <div className="form-card-heading"><p className="eyebrow">Lokasi peralatan</p><h2>Pilih plant dan mesin</h2><p>Mesin akan ditampilkan sesuai plant yang dipilih.</p></div>
        <div className="form-grid-two">
          <label className="form-field">Plant<select value={plantId} onChange={(event) => setPlantId(event.target.value)} disabled={submitting}><option value="">Pilih plant</option>{plants.map((plant) => <option key={plant.id} value={plant.id}>{plant.code} - {plant.name}</option>)}</select></label>
          <label className="form-field">Mesin<select value={machineId} onChange={(event) => setMachineId(event.target.value)} disabled={!plantId || machinesLoading || submitting}><option value="">{!plantId ? 'Pilih plant terlebih dahulu' : machinesLoading ? 'Memuat mesin...' : 'Pilih mesin'}</option>{machines.map((machine) => <option key={machine.id} value={machine.id}>{machine.code} - {machine.name}</option>)}</select></label>
        </div>
        {selectedPlant && <p className="form-helper">Menampilkan {machines.length} mesin pada {selectedPlant.name}.</p>}
        {plantId && !machinesLoading && !machines.length && <p className="form-inline-error">Tidak ada mesin aktif pada plant ini.</p>}
      </section>
      <section className="form-card">
        <div className="form-card-heading"><p className="eyebrow">Detail masalah</p><h2>Jelaskan insiden</h2></div>
        <div className="form-field"><span>Jenis masalah</span><div className="choice-grid">{problemTypes.map((type) => <button type="button" className={`choice-button ${problemType === type.value ? 'choice-button--selected' : ''}`} key={type.value} onClick={() => setProblemType(type.value)} disabled={submitting}>{type.label}</button>)}</div></div>
        <label className="form-field">Deskripsi masalah<textarea value={description} onChange={(event) => setDescription(event.target.value)} onBlur={() => setTouched(true)} rows={4} placeholder="Apa yang terjadi? Sertakan detail yang membantu." disabled={submitting} /></label>
      </section>
      <section className="form-card">
        <div className="question-heading"><p className="eyebrow">Tindakan awal</p><h2>Apakah operator dapat menangani masalah ini?</h2></div>
        <div className="resolution-grid"><button type="button" className={`resolution-button resolution-button--yes ${resolution === 'resolved' ? 'resolution-button--selected' : ''}`} onClick={() => setResolution('resolved')} disabled={submitting}><strong>Dapat diselesaikan operator</strong><span>Catat tindakan dan tutup insiden.</span></button><button type="button" className={`resolution-button resolution-button--no ${resolution === 'cannot-resolve' ? 'resolution-button--selected' : ''}`} onClick={() => setResolution('cannot-resolve')} disabled={submitting}><strong>Tidak dapat diselesaikan</strong><span>Buat tiket untuk tim pemeliharaan.</span></button></div>
        {resolution === 'resolved' && <div className="follow-up-fields"><label className="form-field">Tindakan yang dilakukan<textarea value={actionTaken} onChange={(event) => setActionTaken(event.target.value)} rows={3} placeholder="Jelaskan tindakan operator." disabled={submitting} /></label><label className="form-field">Hasil tindakan<textarea value={result} onChange={(event) => setResult(event.target.value)} rows={3} placeholder="Jelaskan hasil setelah tindakan." disabled={submitting} /></label></div>}
      </section>
      {validationError && <p className="form-inline-error" role="alert">{validationError}</p>}
      {error && <ErrorState title="Laporan belum tersimpan" description={error} />}
      <button className="primary-button submit-report" type="button" onClick={() => void submitReport()} disabled={submitting || machinesLoading}>{submitting ? 'Menyimpan laporan...' : resolution === 'cannot-resolve' ? 'Buat tiket pemeliharaan' : 'Simpan laporan insiden'}</button>
    </div>
    <aside className="report-aside"><p className="eyebrow">Ringkasan</p><h2>{selectedPlant?.name ?? 'Pilih plant'}</h2><p>{selectedMachine?.name ?? 'Pilih mesin untuk melanjutkan laporan.'}</p></aside>
  </div>
  <section className="incident-history">
    <div className="incident-history-heading">
      <div><p className="eyebrow">Catatan tersimpan</p><h2>Riwayat insiden</h2><p>Laporan yang sudah dibuat dari halaman ini.</p></div>
      <button className="secondary-action" type="button" onClick={() => void refreshHistory()} disabled={historyLoading}>{historyLoading ? 'Memuat...' : 'Muat ulang'}</button>
    </div>
    {historyError ? <ErrorState title="Riwayat tidak tersedia" description={historyError} /> : historyLoading ? <LoadingState label="Memuat riwayat insiden" /> : visibleIncidents.length === 0 ? <EmptyState title={plantId ? 'Belum ada insiden pada plant ini' : 'Belum ada riwayat insiden'} description={plantId ? 'Laporan dari plant yang dipilih akan muncul di sini.' : 'Laporan insiden yang berhasil disimpan akan muncul di sini.'} /> : (
      <div className="incident-history-list">
        {visibleIncidents.map((incident) => (
          <article className="incident-history-item" key={incident.id} role="button" tabIndex={0} onClick={() => setSelectedIncident(incident)} onKeyDown={(event) => { if (event.key === 'Enter' || event.key === ' ') setSelectedIncident(incident); }}>
            <div><strong>{problemTypes.find((type) => type.value === incident.problemType)?.label ?? incident.problemType}</strong><p>{incident.description}</p><small>{incident.createdAt ? new Date(incident.createdAt).toLocaleString('id-ID') : 'Waktu tidak tersedia'}</small></div>
            <div className="incident-history-meta"><span>{plants.find((plant) => String(plant.id) === String(incident.plantId))?.name ?? `Plant #${incident.plantId ?? '-'}`}</span><span>{machineDirectory.find((machine) => String(machine.id) === String(incident.machineId))?.name ?? `Mesin #${incident.machineId ?? '-'}`}</span><b>{incident.status === 'RESOLVED' ? 'Selesai' : incident.status === 'OPEN' ? 'Diteruskan ke maintenance' : incident.status ?? 'Tidak diketahui'}</b></div>
          </article>
        ))}
      </div>
    )}
    {selectedIncident && <div className="incident-modal-backdrop" role="presentation" onClick={() => setSelectedIncident(null)}><section className="incident-modal" role="dialog" aria-modal="true" aria-label="Detail insiden" onClick={(event) => event.stopPropagation()}><div className="incident-detail-heading"><div><p className="eyebrow">Detail insiden #{selectedIncident.id}</p><h3>{problemTypes.find((type) => type.value === selectedIncident.problemType)?.label ?? selectedIncident.problemType}</h3></div><button className="icon-button" type="button" onClick={() => setSelectedIncident(null)} aria-label="Tutup detail insiden">×</button></div><dl className="incident-detail-grid"><div><dt>Plant</dt><dd>{plants.find((plant) => String(plant.id) === String(selectedIncident.plantId))?.name ?? `Plant #${selectedIncident.plantId ?? '-'}`}</dd></div><div><dt>Mesin</dt><dd>{machineDirectory.find((machine) => String(machine.id) === String(selectedIncident.machineId))?.name ?? `Mesin #${selectedIncident.machineId ?? '-'}`}</dd></div><div><dt>Waktu</dt><dd>{selectedIncident.createdAt ? new Date(selectedIncident.createdAt).toLocaleString('id-ID') : '-'}</dd></div><div><dt>Status</dt><dd>{selectedIncident.status === 'RESOLVED' ? 'Selesai' : selectedIncident.status ?? 'Tidak diketahui'}</dd></div><div className="incident-detail-wide"><dt>Deskripsi</dt><dd>{selectedIncident.description || '-'}</dd></div><div><dt>Tindakan</dt><dd>{selectedIncident.actionTaken || '-'}</dd></div><div><dt>Hasil</dt><dd>{selectedIncident.result || '-'}</dd></div></dl></section></div>}
  </section>
  </>;
}
