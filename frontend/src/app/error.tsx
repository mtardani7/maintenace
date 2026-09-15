'use client';

import { ErrorState } from '@/components/ui';

export default function GlobalError() {
  return <ErrorState description="Ruang kerja tidak dapat dimuat. Segarkan halaman untuk mencoba lagi." />;
}
