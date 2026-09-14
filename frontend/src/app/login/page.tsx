'use client';

import { FormEvent, useState } from 'react';
import { useRouter } from 'next/navigation';
import { login } from '@/lib/auth';
import { ApiConfigurationError, ApiError } from '@/lib/api';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(''); setBusy(true);
    try { await login(email, password); router.replace('/dashboard'); }
    catch (reason) { setError(reason instanceof ApiConfigurationError ? reason.message : reason instanceof ApiError ? reason.message : 'Unable to sign in right now.'); }
    finally { setBusy(false); }
  }

  return <main className="login-page"><section className="login-aside"><div><div className="brand-lockup"><span className="brand-mark">M</span><div><strong>MAINTENANCE</strong><small>OPERATIONS SYSTEM</small></div></div><h1>Keep the plant moving.</h1><p>A focused operations workspace for the people who keep equipment healthy, safe, and productive.</p></div><footer>FOUNDATION / PHASE 01</footer></section><section className="login-form-wrap"><form className="login-form" onSubmit={handleSubmit}><p className="eyebrow">Secure access</p><h2>Sign in to operations</h2><p>Use your plant credentials to continue to the maintenance workspace.</p>{error && <div className="form-error" role="alert">{error}</div>}<label className="field">Work email<input type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="email" required /></label><label className="field">Password<input type="password" value={password} onChange={(event) => setPassword(event.target.value)} autoComplete="current-password" required /></label><button className="primary-button" type="submit" disabled={busy}>{busy ? 'Connecting...' : 'Sign in'}</button></form></section></main>;
}
