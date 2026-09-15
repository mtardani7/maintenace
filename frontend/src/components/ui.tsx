import type { ReactNode } from 'react';
import { Inbox } from 'lucide-react';

export function LoadingState({ label = 'Memuat ruang kerja' }: { label?: string }) {
  return (
    <div className="state-panel" role="status" aria-live="polite">
      <span className="loader" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="state-panel state-panel--empty" role="status">
      <span className="state-mark" aria-hidden="true"><Inbox size={20} /></span>
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  );
}

export function ErrorState({ title = 'Terjadi kesalahan', description }: { title?: string; description: string }) {
  return (
    <div className="state-panel state-panel--error" role="alert">
      <span className="state-mark" aria-hidden="true">!</span>
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  );
}

export function SectionHeading({ eyebrow, title, description, action }: { eyebrow?: string; title: string; description?: string; action?: ReactNode }) {
  return (
    <header className="section-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {description && <p className="section-heading-description">{description}</p>}
      </div>
      {action}
    </header>
  );
}

export function SurfaceCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`surface-card ${className}`}>{children}</section>;
}

export function DetailCard({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`detail-surface ${className}`}>{children}</section>;
}

export function StatusBadge({ children, tone = 'neutral' }: { children: ReactNode; tone?: 'neutral' | 'success' | 'warning' | 'danger' }) {
  return <span className={`status-badge status-badge--${tone}`}>{children}</span>;
}
