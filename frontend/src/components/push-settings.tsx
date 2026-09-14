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
    navigator.serviceWorker.ready.then((ready) => { setRegistration(ready); setState(Notification.permission === 'granted' ? 'granted' : Notification.permission === 'denied' ? 'denied' : 'default'); }).catch(() => { setState('error'); setMessage('The notification service worker could not be started.'); });
  }, []);

  async function enable() {
    if (!registration) return;
    setMessage('');
    try {
      const permission = Notification.permission === 'default' ? await Notification.requestPermission() : Notification.permission;
      if (permission === 'denied') { setState('denied'); return; }
      if (permission !== 'granted') { setState('error'); setMessage('Notification permission was not granted.'); return; }
      await subscribePush(registration);
      setState('enabled');
    } catch (reason) { setState('error'); setMessage(notificationApiMessage(reason)); }
  }

  if (state === 'checking') return <div className="push-card"><span className="push-card__label">Browser notifications</span><span className="push-card__muted">Checking support...</span></div>;
  if (state === 'unsupported') return <div className="push-card"><span className="push-card__label">Browser notifications</span><span className="push-card__muted">This browser does not support notifications.</span></div>;
  if (state === 'denied') return <div className="push-card"><span className="push-card__label">Browser notifications</span><span className="push-card__muted">Notifications are blocked. Allow them in your browser settings.</span></div>;
  return <div className="push-card"><div><span className="push-card__label">Browser notifications</span><span className="push-card__muted">Get updates for assigned, overdue, and resolved tickets.</span></div>{state === 'enabled' ? <strong className="push-enabled">Enabled</strong> : <button className="secondary-action" onClick={enable}>{state === 'granted' ? 'Enable Notifications' : 'Enable Notifications'}</button>}{state === 'error' && <ErrorState title="Notifications unavailable" description={message} />}</div>;
}
