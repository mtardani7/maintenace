'use client';

import { ErrorState } from '@/components/ui';

export default function GlobalError() {
  return <ErrorState description="The workspace could not load. Refresh the page to try again." />;
}
