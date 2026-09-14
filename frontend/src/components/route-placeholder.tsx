import { EmptyState, SectionHeading } from './ui';

export function RoutePlaceholder({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return <div className="route-placeholder"><SectionHeading eyebrow={eyebrow} title={title} /><p>{description}</p><section className="work-panel"><EmptyState title="Nothing here yet" description="This Phase 1 surface is ready for its Laravel API integration." /></section></div>;
}
