'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { useEffect } from 'react';
import { getCurrentUser } from '@/lib/auth';
import type { Role } from '@/lib/types';

const groups = [
  { label: 'Operations', links: [
    { href: '/dashboard', label: 'Dashboard', icon: '[]' },
    { href: '/machines', label: 'Machines', icon: 'M' },
    { href: '/incidents', label: 'Incidents', icon: '!' },
    { href: '/tickets', label: 'Tickets', icon: 'T' },
  ] },
  { label: 'Monitoring', links: [
    { href: '/notifications', label: 'Notifications', icon: 'N' },
    { href: '/reports', label: 'Reports', icon: 'R', roles: ['supervisor', 'qa', 'admin'] as Role[] },
  ] },
  { label: 'System', links: [{ href: '/settings', label: 'Settings', icon: '*', roles: ['admin'] as Role[] }] },
];

export function Navigation() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [role, setRole] = useState<Role>('operator');

  useEffect(() => { getCurrentUser().then((result) => { if (result.status === 'authenticated' && result.user.role) setRole(result.user.role); }); }, []);

  return (
    <>
      <button className="mobile-menu-button" onClick={() => setMobileOpen(true)} aria-label="Open navigation">+</button>
      {mobileOpen && <button className="mobile-scrim" onClick={() => setMobileOpen(false)} aria-label="Close navigation" />}
      <aside className={`sidebar ${mobileOpen ? 'sidebar--open' : ''}`}>
        <div className="brand-lockup">
          <span className="brand-mark">M</span>
          <div><strong>MAINTENANCE</strong><small>OPERATIONS SYSTEM</small></div>
          <button className="mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close navigation">x</button>
        </div>
        <nav aria-label="Primary navigation">
          {groups.map((group) => <div className="nav-group" key={group.label}><div className="nav-label">{group.label}</div>{group.links.filter((link) => !link.roles || link.roles.includes(role)).map((link) => {
            const active = pathname === link.href || (link.href !== '/dashboard' && pathname.startsWith(link.href));
            return <Link key={link.href} href={link.href} onClick={() => setMobileOpen(false)} className={`nav-link ${active ? 'nav-link--active' : ''}`}><span className="nav-icon">{link.icon}</span><span>{link.label}</span></Link>;
          })}</div>)}
        </nav>
        <div className="sidebar-foot"><span className="status-dot" /> System foundation <small>PHASE 01</small></div>
      </aside>
    </>
  );
}
