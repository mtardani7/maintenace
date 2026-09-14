import { NotificationCenter } from '@/components/notification-center';
import { PushSettings } from '@/components/push-settings';
import { SectionHeading } from '@/components/ui';

export default function NotificationsPage() {
	return <>
		<SectionHeading eyebrow="Attention center" title="Notifications" />
		<PushSettings />
		<NotificationCenter />
	</>;
}
