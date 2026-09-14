'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createIncident, createTicket, getMachines } from '@/lib/maintenance-api';
import type { Machine } from '@/lib/maintenance-types';
import { EmptyState, ErrorState, LoadingState } from './ui';

const problemTypes = ['Machine stopped', 'Abnormal sound', 'Sensor problem', 'Quality problem', 'Other'];

type Resolution = 'resolved' | 'cannot-resolve' | '';

export function IncidentReport() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [machines, setMachines] = useState<Machine[]>([]);
  const [machineId, setMachineId] = useState(searchParams.get('machine') ?? '');
  const [problemType, setProblemType] = useState('');
  const [description, setDescription] = useState('');
  const [resolution, setResolution] = useState<Resolution>('');
  const [actionTaken, setActionTaken] = useState('');
  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    getMachines().then(setMachines).catch((reason: unknown) => setError(reason instanceof Error ? reason.message : 'Unable to load machines.')).finally(() => setLoading(false));
  }, []);

  function validate() {
    if (!machineId) return 'Select a machine first.';
    if (!problemType) return 'Select the problem type.';
    if (!description.trim()) return 'Describe the problem.';
    if (!resolution) return 'Choose Resolved or Create Maintenance Ticket.';
    if (resolution === 'resolved' && (!actionTaken.trim() || !result.trim())) return 'Add what you did and the result before logging this as resolved.';
    return '';
  }

  async function submitReport() {
    const validationError = validate();
    if (validationError) { setError(validationError); return; }
    setError(''); setSubmitting(true);
    try {
      if (resolution === 'resolved') {
        await createIncident({ machineId, problemType, description: description.trim(), actionTaken: actionTaken.trim(), result: result.trim() });
        setSuccess('Incident log created. No maintenance ticket was opened.');
      } else {
        await createTicket({ machineId, problemType, description: description.trim(), source: 'OPERATOR' });
        setSuccess('Maintenance ticket created and routed to the team.');
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : 'The report could not be submitted.');
    } finally { setSubmitting(false); }
  }

  if (loading) return <LoadingState label="Loading machines" />;
  if (success) return <div className="success-panel"><span className="success-mark">OK</span><h2>{success}</h2><p>The record was accepted by the maintenance system.</p><button className="primary-button" onClick={() => router.push('/dashboard')}>Return to dashboard</button></div>;
  if (!machines.length && !error) return <EmptyState title="No machines available" description="Connect the machine API before reporting an incident." />;

  return <div className="report-layout"><div className="report-main"><div className="stepper"><span className="stepper__active">01 Machine</span><span>02 Problem</span><span>03 Resolution</span></div><section className="form-card"><label className="form-field">Machine<select value={machineId} onChange={(event) => setMachineId(event.target.value)}><option value="">Select machine</option>{machines.map((machine) => <option key={machine.id} value={machine.id}>{machine.code} / {machine.name}</option>)}</select></label><div className="form-field"><span>Problem type</span><div className="choice-grid">{problemTypes.map((type) => <button type="button" className={`choice-button ${problemType === type ? 'choice-button--selected' : ''}`} key={type} onClick={() => setProblemType(type)}>{type}</button>)}</div></div><label className="form-field">Describe the problem<textarea value={description} onChange={(event) => setDescription(event.target.value)} rows={4} placeholder="What happened? Include any useful detail." /></label></section><section className="form-card"><div className="question-heading"><p className="eyebrow">Initial troubleshooting</p><h2>Can the operator handle this problem?</h2></div><div className="resolution-grid"><button type="button" className={`resolution-button resolution-button--yes ${resolution === 'resolved' ? 'resolution-button--selected' : ''}`} onClick={() => setResolution('resolved')}><strong>Resolved by Operator</strong><span>Log the action and close the loop.</span></button><button type="button" className={`resolution-button resolution-button--no ${resolution === 'cannot-resolve' ? 'resolution-button--selected' : ''}`} onClick={() => setResolution('cannot-resolve')}><strong>Cannot Resolve</strong><span>Create a maintenance ticket.</span></button></div>{resolution === 'resolved' && <div className="follow-up-fields"><label className="form-field">Action taken<textarea value={actionTaken} onChange={(event) => setActionTaken(event.target.value)} rows={3} placeholder="What did you do?" /></label><label className="form-field">Result<textarea value={result} onChange={(event) => setResult(event.target.value)} rows={3} placeholder="What was the outcome?" /></label></div>}</section>{error && <ErrorState title="Report not submitted" description={error} />}<button className="primary-button submit-report" onClick={submitReport} disabled={submitting}>{submitting ? 'Submitting...' : resolution === 'resolved' ? 'Create Incident Log' : 'Create Maintenance Ticket'}</button></div><aside className="report-aside"><p className="eyebrow">Fast operator flow</p><h2>Machine first. Context second.</h2><p>Only the information needed to route this report correctly is requested. Your identity and timestamp come from Laravel authentication.</p></aside></div>;
}
