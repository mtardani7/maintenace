import { AdminUserForm } from '@/components/admin-user-form';
import { SectionHeading } from '@/components/ui';

export default function SettingsPage() {
	return <><SectionHeading eyebrow="Configuration" title="Settings" /><AdminUserForm /></>;
}
