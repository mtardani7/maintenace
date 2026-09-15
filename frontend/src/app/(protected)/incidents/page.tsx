import { IncidentReport } from '@/components/incident-report';
import { SectionHeading } from '@/components/ui';

export default function IncidentsPage() {
	return <>
		<SectionHeading eyebrow="Kejadian pabrik" title="Laporkan masalah" description="Catat masalah peralatan dan teruskan ke pemeliharaan." />
		<IncidentReport />
	</>;
}
