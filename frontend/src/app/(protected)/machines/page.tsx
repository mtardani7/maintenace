import { MachineList } from '@/components/machine-list';
import { SectionHeading } from '@/components/ui';

export default function MachinesPage() {
	return <>
		<SectionHeading eyebrow="Asset register" title="Machines" />
		<MachineList />
	</>;
}
