import { NotificationCenter } from '@/components/notification-center';
import { PushSettings } from '@/components/push-settings';
import { SectionHeading } from '@/components/ui';

export default function NotificationsPage() {
	return <>
		<SectionHeading eyebrow="Pusat perhatian" title="Notifikasi" description="Tinjau pembaruan dan peringatan pemeliharaan terbaru." />
		<PushSettings />
		<NotificationCenter />
	</>;
}
