import type { Role } from './types';

export const roles: { id: Role; label: string; scope: string }[] = [
  { id: 'operator', label: 'Operator', scope: 'Monitor plant status and report incidents' },
  { id: 'technician', label: 'Technician', scope: 'Execute assigned maintenance work' },
  { id: 'supervisor', label: 'Supervisor', scope: 'Coordinate teams and priorities' },
  { id: 'qa', label: 'QA', scope: 'Review quality and completion evidence' },
  { id: 'admin', label: 'Admin', scope: 'Manage users and system configuration' },
];

export const routeAccess: Record<string, Role[]> = {
  '/dashboard': ['operator', 'technician', 'supervisor', 'qa', 'admin'],
  '/machines': ['operator', 'technician', 'supervisor', 'qa', 'admin'],
  '/incidents': ['operator', 'technician', 'supervisor', 'qa', 'admin'],
  '/tickets': ['operator', 'technician', 'supervisor', 'qa', 'admin'],
  '/notifications': ['operator', 'technician', 'supervisor', 'qa', 'admin'],
  '/qa': ['qa', 'admin'],
  '/supervisor': ['supervisor', 'admin'],
  '/reports': ['supervisor', 'qa', 'admin'],
  '/settings': ['admin'],
};
