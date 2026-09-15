'use client';

import { useEffect, useState } from 'react';
import { notificationApiMessage, subscribePush } from '@/lib/notification-api';
import { ErrorState } from './ui';

type PushState = 'checking' | 'unsupported' | 'default' | 'granted' | 'denied' | 'enabled' | 'error';

export function PushSettings() {
  const [state, setState] = useState<PushState>('checking');
  const [message, setMessage] = useState('');
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    if (!('Notification' in window) || !('serviceWorker' in navigator) || !('PushManager' in window)) { setState('unsupported'); return; }
    navigator.serviceWorker.ready.then((ready) => { setRegistration(ready); setState(Notification.permission === 'granted' ? 'granted' : Notification.permission === 'denied' ? 'denied' : 'default'); }).catch(() => { setState('error'); setMessage('Service worker notifikasi tidak dapat dijalankan.'); });
  }, []);

  async function enable() {
    if (!registration) return;
    setMessage('');
    try {
      const permission = Notification.permission === 'default' ? await Notification.requestPermission() : Notification.permission;
      if (permission === 'denied') { setState('denied'); return; }
      if (permission !== 'granted') { setState('error'); setMessage('Izin notifikasi tidak diberikan.'); return; }
      await subscribePush(registration);
      setState('enabled');
    } catch (reason) { setState('error'); setMessage(notificationApiMessage(reason)); }
  }

  if (state === 'checking') return <div className="push-card"><span className="push-card__label">Notifikasi browser</span><span className="push-card__muted">Memeriksa dukungan...</span></div>;
  if (state === 'unsupported') return <div className="push-card"><span className="push-card__label">Notifikasi browser</span><span className="push-card__muted">Browser ini tidak mendukung notifikasi.</span></div>;
  if (state === 'denied') return <div className="push-card"><span className="push-card__label">Notifikasi browser</span><span className="push-card__muted">Notifikasi diblokir. Izinkan melalui pengaturan browser.</span></div>;
  return <div className="push-card"><div><span className="push-card__label">Notifikasi browser</span><span className="push-card__muted">Dapatkan pembaruan tiket yang ditugaskan, terlambat, dan selesai.</span></div>{state === 'enabled' ? <strong className="push-enabled">Aktif</strong> : <button className="secondary-action" onClick={enable}>Aktifkan notifikasi</button>}{state === 'error' && <ErrorState title="Notifikasi tidak tersedia" description={message} />}</div>;
}
