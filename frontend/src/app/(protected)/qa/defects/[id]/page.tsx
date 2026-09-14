import { QADefectDetail } from '@/components/qa-defect-detail';

export default async function QADefectPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <QADefectDetail defectId={id} />;
}