import { IncidentReport } from '@/components/incident-report';
import { SectionHeading } from '@/components/ui';

export default function IncidentsPage() {
	return <>
		<SectionHeading eyebrow="Plant events" title="Report a problem" />
		<IncidentReport />
	</>;
}
