import type { Metadata, Viewport } from 'next';
import { ServiceWorkerRegistration } from '@/components/service-worker-registration';
import './globals.css';
import './phase8.css';

export const metadata: Metadata = {
  title: 'Maintenance Operations',
  description: 'Maintenance operations workspace',
  applicationName: 'Maintenance Operations',
};

export const viewport: Viewport = {
  themeColor: '#991015',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><head><link rel="manifest" href="/manifest.webmanifest" /></head><body><ServiceWorkerRegistration />{children}</body></html>;
}
