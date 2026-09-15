import type { Metadata, Viewport } from 'next';
import { ServiceWorkerRegistration } from '@/components/service-worker-registration';
import './globals.css';

export const metadata: Metadata = {
  title: 'Maintenance System',
  description: 'Ruang kerja operasional pemeliharaan',
  applicationName: 'Maintenance System',
  icons: { icon: `${process.env.NEXT_PUBLIC_BASE_PATH ?? ''}/qa-logo.png` },
};

export const viewport: Viewport = {
  themeColor: '#991015',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? '';
  return <html lang="id"><head><link rel="manifest" href={`${basePath}/manifest.webmanifest`} /></head><body><ServiceWorkerRegistration />{children}</body></html>;
}
