import { TicketList } from '@/components/ticket-list';
import { SectionHeading } from '@/components/ui';

export default function TicketsPage() {
	return <>
		<SectionHeading eyebrow="Manajemen pekerjaan" title="Tiket pemeliharaan" description="Kerjakan tiket terbuka, isi hasil pekerjaan, lalu tutup sebagai riwayat." />
		<TicketList />
	</>;
}
