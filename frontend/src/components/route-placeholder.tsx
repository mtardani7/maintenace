import { EmptyState, SectionHeading } from './ui';

export function RoutePlaceholder({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="route-placeholder"><SectionHeading eyebrow={eyebrow} title={title} /><p>{description}</p><section className="work-panel"><EmptyState title="Belum ada data" description="Halaman Fase 1 ini siap diintegrasikan dengan API Laravel." /></section></div>;
}
