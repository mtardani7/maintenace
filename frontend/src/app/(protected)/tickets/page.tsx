import { TicketList } from '@/components/ticket-list';
import { SectionHeading } from '@/components/ui';

export default function TicketsPage() {
	return <>
		<SectionHeading eyebrow="Work management" title="Maintenance tickets" />
		<TicketList />
	</>;
}
