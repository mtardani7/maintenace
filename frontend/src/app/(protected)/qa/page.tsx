import { QADashboard } from '@/components/qa-dashboard';
import { SectionHeading } from '@/components/ui';

export default function QAPage() {
  return <>
    <SectionHeading eyebrow="Quality system" title="QA dashboard" />
    <QADashboard />
  </>;
}