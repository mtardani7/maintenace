import { TicketList } from '@/components/ticket-list';
import { SectionHeading } from '@/components/ui';

export default function TicketsPage() {
	return <>
		<SectionHeading eyebrow="Manajemen pekerjaan" title="Tiket pemeliharaan" description="Lacak, tugaskan, dan selesaikan pekerjaan pemeliharaan." />
		<TicketList />
	</>;
}
