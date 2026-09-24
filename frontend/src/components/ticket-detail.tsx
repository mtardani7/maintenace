'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { addSparePart, apiMessage, getMaintenanceUsers, getTicket, performTicketAction, removeSparePart, updateBreakdownAnalysis, updateVerificationChecklist } from '@/lib/ticket-api';
import type { BreakdownAnalysisInput, MaintenanceUser, SparePart, Ticket, TicketActionInput, VerificationChecklist, VerificationKey, VerificationValue } from '@/lib/ticket-types';
import { EmptyState, ErrorState, LoadingState } from './ui';

function label(value: string) {
  return value.replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
}

const verificationItems: Array<{ key: VerificationKey; label: string }> = [
  { key: 'machine_cleanliness', label: 'Machine Cleanliness' },
  { key: 'water', label: 'Water' },
  { key: 'grease', label: 'Grease' },
  { key: 'gram', label: 'Gram' },
  { key: 'machine_function', label: 'Machine Function' },
  { key: 'machine_safety', label: 'Machine Safety' },
  { key: 'tool', label: 'Tool' },
];

export function TicketDetailView({ ticketId }: { ticketId: string }) {
  const [ticket, setTicket] = useState<Ticket | null>(null);
  const [maintenanceUsers, setMaintenanceUsers] = useState<MaintenanceUser[]>([]);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState('');
  const [actionTaken, setActionTaken] = useState('');
  const [executorId, setExecutorId] = useState('');
  const [durationHours, setDurationHours] = useState('');
  const [solution, setSolution] = useState('');
  const [showSparePartForm, setShowSparePartForm] = useState(false);
  const [sparePartName, setSparePartName] = useState('');
  const [materialCode, setMaterialCode] = useState('');
  const [quantity, setQuantity] = useState('1');
  const [remark, setRemark] = useState('');
  const [sparePartBusy, setSparePartBusy] = useState(false);
  const [rootCauseAnalysis, setRootCauseAnalysis] = useState('');
  const [correctiveActionPlan, setCorrectiveActionPlan] = useState('');
  const [targetAt, setTargetAt] = useState('');
  const [actionById, setActionById] = useState('');
  const [analysisBusy, setAnalysisBusy] = useState(false);
  const [verification, setVerification] = useState<VerificationChecklist>({});
  const [verificationBusy, setVerificationBusy] = useState(false);

  useEffect(() => {
    getTicket(ticketId).then((result) => {
      setTicket(result);
      setReason(result.reason ?? '');
      setActionTaken(result.actionTaken ?? '');
      setExecutorId(result.executor?.id ? String(result.executor.id) : '');
      setDurationHours(result.durationHours ? String(result.durationHours) : '');
      setSolution(result.solution ?? '');
      setRootCauseAnalysis(result.rootCauseAnalysis ?? '');
      setCorrectiveActionPlan(result.correctiveActionPlan ?? '');
      setTargetAt(result.targetAt ? result.targetAt.replace(' ', 'T').slice(0, 16) : '');
      setActionById(result.actionBy?.id ? String(result.actionBy.id) : '');
      setVerification(result.verificationChecklist ?? {});
    }).catch((requestError) => setError(apiMessage(requestError)));
    getMaintenanceUsers().then(setMaintenanceUsers).catch(() => setMaintenanceUsers([]));
  }, [ticketId]);

  if (error) return <ErrorState title="Tiket tidak tersedia" description={error} />;
  if (!ticket) return <LoadingState label="Memuat tiket" />;

  async function closeTicket() {
    if (!reason.trim() || !actionTaken.trim() || !executorId || !durationHours || Number(durationHours) <= 0 || !solution.trim()) {
      setActionError('Lengkapi penyebab, tindakan, pelaksana, durasi, dan hasil pekerjaan.');
      return;
    }
    setActionError('');
    setBusy(true);
    try {
      const input: TicketActionInput = { reason: reason.trim(), actionTaken: actionTaken.trim(), executorId, durationHours: Number(durationHours), solution: solution.trim() };
      setTicket(await performTicketAction(ticketId, 'close', input));
    } catch (requestError) {
      setActionError(apiMessage(requestError));
    } finally {
      setBusy(false);
    }
  }

  async function saveSparePart() {
    if (!sparePartName.trim() || !materialCode.trim() || !quantity || Number(quantity) < 1) {
      setActionError('Lengkapi nama spare part, kode material, dan jumlah.');
      return;
    }
    setActionError('');
    setSparePartBusy(true);
    try {
      const part = await addSparePart(ticketId, { name: sparePartName.trim(), materialCode: materialCode.trim(), quantity: Number(quantity), remark: remark.trim() });
      setTicket((current) => current ? { ...current, spareParts: [...current.spareParts, part] } : current);
      setSparePartName('');
      setMaterialCode('');
      setQuantity('1');
      setRemark('');
      setShowSparePartForm(false);
    } catch (requestError) {
      setActionError(apiMessage(requestError));
    } finally {
      setSparePartBusy(false);
    }
  }

  async function deleteSparePart(part: SparePart) {
    setActionError('');
    setSparePartBusy(true);
    try {
      await removeSparePart(ticketId, part.id);
      setTicket((current) => current ? { ...current, spareParts: current.spareParts.filter((item) => item.id !== part.id) } : current);
    } catch (requestError) {
      setActionError(apiMessage(requestError));
    } finally {
      setSparePartBusy(false);
    }
  }

  async function saveAnalysis() {
    setActionError('');
    setAnalysisBusy(true);
    try {
      const input: BreakdownAnalysisInput = { rootCauseAnalysis: rootCauseAnalysis.trim() || undefined, correctiveActionPlan: correctiveActionPlan.trim() || undefined, targetAt: targetAt || undefined, actionById: actionById || undefined };
      setTicket(await updateBreakdownAnalysis(ticketId, input));
    } catch (requestError) {
      setActionError(apiMessage(requestError));
    } finally {
      setAnalysisBusy(false);
    }
  }

  async function saveVerification() {
    setActionError('');
    setVerificationBusy(true);
    try {
      setTicket(await updateVerificationChecklist(ticketId, verification));
    } catch (requestError) {
      setActionError(apiMessage(requestError));
    } finally {
      setVerificationBusy(false);
    }
  }

  return <div className="ticket-detail-layout">
    <main>
      <div className="ticket-detail-hero"><div><p className="eyebrow">{ticket.number}</p><h1>{ticket.problemType}</h1><p>{ticket.plant} / {ticket.machine.code} / {ticket.machine.name}</p></div><b className={`ticket-status ticket-status--${ticket.status.toLowerCase()}`}>{label(ticket.status)}</b></div>
      <section className="ticket-info-card ticket-summary-card">
        <h2>Informasi ticket</h2>
        <dl className="ticket-facts"><div><dt>Ticket Number</dt><dd>{ticket.number}</dd></div><div><dt>Plant</dt><dd>{ticket.plant}</dd></div><div><dt>Machine</dt><dd>{ticket.machine.code} / {ticket.machine.name}</dd></div><div><dt>Problem</dt><dd>{ticket.problemType}</dd></div><div><dt>Priority</dt><dd>{label(ticket.priority)}</dd></div><div><dt>Reporter</dt><dd>{ticket.reporter?.name ?? 'Provided by Laravel'}</dd></div><div><dt>Source</dt><dd>{ticket.sourceType ?? '--'}</dd></div><div><dt>Status</dt><dd><span className={`ticket-status ticket-status--${ticket.status.toLowerCase()}`}>{label(ticket.status)}</span></dd></div></dl>
        <div className="ticket-description"><dt>Deskripsi masalah</dt><p>{ticket.description}</p></div>
      </section>
      <section className="ticket-info-card breakdown-card ticket-breakdown-section">
        <div className="card-heading"><div><h2>Post Breakdown Analysis</h2><p>Analisa lanjutan yang bersifat optional.</p></div></div>
        {ticket.status === 'OPEN' ? <div className="breakdown-form"><label className="form-field">Root Cause Analysis / Analisa Akar Masalah<textarea rows={3} value={rootCauseAnalysis} onChange={(event) => setRootCauseAnalysis(event.target.value)} placeholder="Jelaskan akar masalah" /></label><label className="form-field">Corrective Action Plan / Rencana Tindakan Perbaikan<textarea rows={3} value={correctiveActionPlan} onChange={(event) => setCorrectiveActionPlan(event.target.value)} placeholder="Jelaskan rencana tindakan perbaikan" /></label><div className="work-detail-grid"><label className="form-field">Target<input type="datetime-local" value={targetAt} onChange={(event) => setTargetAt(event.target.value)} /></label><label className="form-field">Action By / Pelaksana<select value={actionById} onChange={(event) => setActionById(event.target.value)}><option value="">Pilih user maintenance</option>{maintenanceUsers.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select></label></div><button className="secondary-action" type="button" onClick={() => void saveAnalysis()} disabled={analysisBusy}>{analysisBusy ? 'Menyimpan...' : 'Simpan Analisa'}</button></div> : <dl className="ticket-facts work-detail-history"><div className="work-detail-wide"><dt>Root Cause Analysis / Analisa Akar Masalah</dt><dd>{ticket.rootCauseAnalysis || '--'}</dd></div><div className="work-detail-wide"><dt>Corrective Action Plan / Rencana Tindakan Perbaikan</dt><dd>{ticket.correctiveActionPlan || '--'}</dd></div><div><dt>Target</dt><dd>{ticket.targetAt || '--'}</dd></div><div><dt>Action By / Pelaksana</dt><dd>{ticket.actionBy?.name || '--'}</dd></div></dl>}
      </section>
      <section className="ticket-info-card spare-parts-card ticket-spare-section">
        <div className="card-heading"><div><h2>Spare Part</h2><p>Komponen yang digunakan pada pekerjaan ini.</p></div>{ticket.status === 'OPEN' && <button className="secondary-action" type="button" onClick={() => setShowSparePartForm((current) => !current)} disabled={sparePartBusy}>{showSparePartForm ? 'Batal' : 'Tambah Spare Part'}</button>}</div>
        {ticket.spareParts.length === 0 ? <p className="spare-parts-empty">Belum ada spare part.</p> : <div className="spare-parts-list">{ticket.spareParts.map((part) => <div className="spare-part-row" key={part.id}><div><strong>{part.name}</strong><small>{part.materialCode}{part.remark ? ` · ${part.remark}` : ''}</small></div><span>{part.quantity}</span>{ticket.status === 'OPEN' && <button className="icon-button spare-part-remove" type="button" onClick={() => void deleteSparePart(part)} disabled={sparePartBusy} aria-label={`Hapus ${part.name}`}>×</button>}</div>)}</div>}
        {showSparePartForm && ticket.status === 'OPEN' && <div className="spare-part-form"><label className="form-field">Nama Spare Part<input value={sparePartName} onChange={(event) => setSparePartName(event.target.value)} placeholder="Contoh: Bearing" /></label><div className="work-detail-grid"><label className="form-field">Kode Material<input value={materialCode} onChange={(event) => setMaterialCode(event.target.value)} placeholder="MAT-001" /></label><label className="form-field">Jumlah<input type="number" min="1" step="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} /></label></div><label className="form-field">Keterangan<textarea rows={2} value={remark} onChange={(event) => setRemark(event.target.value)} placeholder="Keterangan (optional)" /></label><button className="primary-button" type="button" onClick={() => void saveSparePart()} disabled={sparePartBusy}>{sparePartBusy ? 'Menyimpan...' : 'Simpan Spare Part'}</button></div>}
      </section>
      <section className="ticket-info-card work-detail-card ticket-work-section">
        <div className="card-heading"><div><h2>Hasil Pekerjaan</h2><p>Detail pekerjaan maintenance pada ticket ini.</p></div></div>
        {ticket.status === 'OPEN' ? <div className="work-detail-form">
          <label className="form-field">Cause / Penyebab<textarea rows={3} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Jelaskan penyebab masalah" /></label>
          <label className="form-field">Action / Tindakan<textarea rows={3} value={actionTaken} onChange={(event) => setActionTaken(event.target.value)} placeholder="Jelaskan tindakan perbaikan" /></label>
          <div className="work-detail-grid"><label className="form-field">Executor / Pelaksana<select value={executorId} onChange={(event) => setExecutorId(event.target.value)}><option value="">Pilih user maintenance</option>{maintenanceUsers.map((user) => <option key={user.id} value={user.id}>{user.name}</option>)}</select></label><label className="form-field">Duration / Durasi pekerjaan<input type="number" min="0.25" step="0.25" value={durationHours} onChange={(event) => setDurationHours(event.target.value)} placeholder="Jam" /></label></div>
          <label className="form-field">Solution / Hasil pekerjaan<textarea rows={4} value={solution} onChange={(event) => setSolution(event.target.value)} placeholder="Jelaskan hasil akhir pekerjaan" /></label>
          <button className="primary-button" disabled={busy} onClick={() => void closeTicket()}>{busy ? 'Menyimpan...' : 'Simpan dan tutup ticket'}</button>
        </div> : <dl className="ticket-facts work-detail-history"><div><dt>Cause / Penyebab</dt><dd>{ticket.reason || '--'}</dd></div><div><dt>Action / Tindakan</dt><dd>{ticket.actionTaken || '--'}</dd></div><div><dt>Executor / Pelaksana</dt><dd>{ticket.executor?.name || '--'}</dd></div><div><dt>Duration / Durasi</dt><dd>{ticket.durationHours ? `${ticket.durationHours} jam` : '--'}</dd></div><div className="work-detail-wide"><dt>Solution / Hasil pekerjaan</dt><dd>{ticket.solution || '--'}</dd></div></dl>}
        {actionError && <ErrorState title="Ticket belum ditutup" description={actionError} />}
        {ticket.status === 'CLOSED' && <EmptyState title="Ticket CLOSED" description="Detail pekerjaan ini tersimpan sebagai history dan tidak dapat diedit." />}
      </section>
      <section className="ticket-info-card verification-card">
        <div className="card-heading"><div><h2>Equipment Verification &amp; Hygiene</h2><p>Checklist optional sebelum ticket ditutup.</p></div></div>
        <div className="verification-list">{verificationItems.map((item) => <div className="verification-row" key={item.key}><strong>{item.label}</strong><div className="verification-options">{(['OK', 'NOK', 'N/A'] as VerificationValue[]).map((value) => <label className={`verification-option verification-option--${value.toLowerCase().replace('/', '-')}${verification[item.key] === value ? ' verification-option--selected' : ''}`} key={value}><input type="radio" name={`verification-${item.key}`} value={value} checked={verification[item.key] === value} onChange={() => setVerification((current) => ({ ...current, [item.key]: value }))} disabled={ticket.status === 'CLOSED' || verificationBusy} /><span>{value}</span></label>)}</div></div>)}</div>
        {ticket.status === 'OPEN' ? <button className="secondary-action verification-save" type="button" onClick={() => void saveVerification()} disabled={verificationBusy}>{verificationBusy ? 'Menyimpan...' : 'Simpan Checklist'}</button> : <p className="verification-history-note">Checklist tersimpan sebagai history dan tidak dapat diedit.</p>}
      </section>
      {ticket.status === 'CLOSED' && <section className="ticket-info-card closed-history-card"><div className="card-heading"><div><h2>History</h2><p>Ticket ini sudah ditutup dan seluruh detailnya bersifat read-only.</p></div></div><dl className="ticket-facts"><div><dt>Closed At</dt><dd>{ticket.closedAt || '--'}</dd></div><div><dt>Closed By</dt><dd>{ticket.closedBy?.name || '--'}</dd></div></dl></section>}
    </main>
    <aside className="ticket-actions"><Link className="back-link" href="/tickets">Kembali ke tickets</Link><section className="action-card"><p className="eyebrow">Maintenance</p><p className="action-note">{ticket.status === 'OPEN' ? 'Lengkapi Hasil Pekerjaan untuk menutup ticket.' : 'Ticket sudah CLOSED dan tersimpan sebagai history.'}</p></section></aside>
  </div>;
}