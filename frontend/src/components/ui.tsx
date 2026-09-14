import type { ReactNode } from 'react';

export function LoadingState({ label = 'Loading workspace' }: { label?: string }) {
  return (
    <div className="state-panel" role="status" aria-live="polite">
      <span className="loader" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

export function EmptyState({ title, description }: { title: string; description: string }) {
  return (
    <div className="state-panel state-panel--empty">
      <span className="state-mark" aria-hidden="true">--</span>
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  );
}

export function ErrorState({ title = 'Something went wrong', description }: { title?: string; description: string }) {
  return (
    <div className="state-panel state-panel--error" role="alert">
      <span className="state-mark" aria-hidden="true">!</span>
      <strong>{title}</strong>
      <span>{description}</span>
    </div>
  );
}

export function SectionHeading({ eyebrow, title, action }: { eyebrow?: string; title: string; action?: ReactNode }) {
  return (
    <div className="section-heading">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
      </div>
      {action}
    </div>
  );
}
