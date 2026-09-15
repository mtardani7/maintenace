import { AdminUserForm } from '@/components/admin-user-form';
import { SectionHeading } from '@/components/ui';

export default function SettingsPage() {
		return <><SectionHeading eyebrow="Konfigurasi" title="Pengaturan" description="Kelola konfigurasi sistem pemeliharaan dan pengguna." /><AdminUserForm /></>;
}
