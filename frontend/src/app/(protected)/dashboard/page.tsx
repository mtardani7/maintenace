import { OperationsDashboard } from '@/components/operations-dashboard';
import Link from 'next/link';

export default function DashboardPage() { return <><div className="dashboard-intro"><div><p className="eyebrow">Live plant status</p><h1>Operations overview</h1><p>Prioritize critical work and SLA risk across the maintenance operation.</p></div><div className="dashboard-intro__actions"><span className="date-stamp">DATA SOURCE / LARAVEL</span><Link className="primary-button primary-button--link" href="/incidents">Report Problem</Link></div></div><OperationsDashboard /></>; }
