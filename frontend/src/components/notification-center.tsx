'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import type { MouseEvent } from 'react';
import { getNotifications, markAllNotificationsRead, markNotificationRead, notificationApiMessage } from '@/lib/notification-api';
import type { AppNotification } from '@/lib/notification-types';
import { EmptyState, ErrorState, LoadingState } from './ui';

export function NotificationCenter() {
  const [items, setItems] = useState<AppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => { getNotifications().then((page) => { setItems(page.data); setUnread(page.unreadCount); }).catch((reason) => setError(notificationApiMessage(reason))).finally(() => setLoading(false)); }, []);
  async function read(item: AppNotification) { if (!item.read) { try { await markNotificationRead(item.id); setItems((current) => current.map((entry) => entry.id === item.id ? { ...entry, read: true } : entry)); setUnread((current) => Math.max(0, current - 1)); } catch (reason) { setError(notificationApiMessage(reason)); return false; } } return true; }
  async function openNotification(event: MouseEvent<HTMLAnchorElement>, item: AppNotification) { event.preventDefault(); if (await read(item)) window.location.assign(item.url ?? (item.relatedTicketId ? `/tickets/${item.relatedTicketId}` : '/notifications')); }
  async function readAll() { try { await markAllNotificationsRead(); setItems((current) => current.map((item) => ({ ...item, read: true }))); setUnread(0); } catch (reason) { setError(notificationApiMessage(reason)); } }

  if (loading) return <LoadingState label="Memuat notifikasi" />;
  if (error) return <ErrorState title="Notifikasi tidak tersedia" description={error} />;
  return <div className="notification-center"><div className="notification-toolbar"><div><p className="eyebrow">Pusat perhatian</p><p className="notification-count">{unread} notifikasi belum dibaca</p></div><button className="secondary-action" disabled={!unread} onClick={readAll}>Tandai semua sudah dibaca</button></div>{items.length === 0 ? <EmptyState title="Tidak ada notifikasi" description="Pembaruan maintenance terbaru akan muncul di sini." /> : <div className="notification-list">{items.map((item) => <div className={`notification-item ${item.read ? '' : 'notification-item--unread'}`} key={item.id}><Link href={item.url ?? (item.relatedTicketId ? `/tickets/${item.relatedTicketId}` : '/notifications')} onClick={(event) => openNotification(event, item)}><span className="notification-type">{item.type.replaceAll('_', ' ')}</span><strong>{item.title}</strong><p>{item.body}</p><small>{item.createdAt}</small></Link>{!item.read && <button className="notification-read-button" aria-label="Tandai sudah dibaca" onClick={() => read(item)}>Tandai sudah dibaca</button>}</div>)}</div>}</div>;
}
