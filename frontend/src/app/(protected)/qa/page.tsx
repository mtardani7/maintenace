import { QADashboard } from '@/components/qa-dashboard';
import { SectionHeading } from '@/components/ui';

export default function QAPage() {
  return <>
    <SectionHeading eyebrow="Sistem mutu" title="Dasbor QA" description="Tinjau cacat mutu yang terhubung dengan pekerjaan pemeliharaan." />
    <QADashboard />
  </>;
}