'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { getUnreadNotificationCount } from '@/lib/notification-api';
import { getCurrentUser } from '@/lib/auth';
import type { User } from '@/lib/types';

const titles: Record<string, string> = {
  '/dashboard': 'Operations overview',
  '/machines': 'Machine registry',
  '/incidents': 'Incident log',
  '/tickets': 'Maintenance tickets',
  '/notifications': 'Notifications',
  '/reports': 'Reports',
  '/settings': 'System settings',
};

export function Header() {
  const pathname = usePathname();
  const title = titles[pathname] ?? 'Operations overview';
  const [unread, setUnread] = useState(0);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => { getUnreadNotificationCount().then(setUnread).catch(() => setUnread(0)); getCurrentUser().then((result) => { if (result.status === 'authenticated') setUser(result.user); }); }, [pathname]);

  const initials = user?.name.split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase() ?? 'OP';
  return <header className="topbar"><div><p className="topbar-kicker">PLANT CONTROL / PHASE 08</p><h2>{title}</h2></div><div className="topbar-actions"><Link className="notification-indicator" href="/notifications" aria-label={`${unread} unread notifications`}><span className="notification-bell" aria-hidden="true">N</span>{unread > 0 && <b>{unread > 99 ? '99+' : unread}</b>}</Link><div className="profile"><span className="profile-avatar">{initials}</span><div><strong>{user?.name ?? 'Loading user'}</strong><small>{user?.role ?? 'Session'}</small></div><span className="profile-chevron" aria-hidden="true">v</span></div></div></header>;
}
