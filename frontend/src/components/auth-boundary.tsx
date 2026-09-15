'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { getCurrentUser } from '@/lib/auth';
import type { User } from '@/lib/types';
import { ErrorState, LoadingState } from './ui';

export function AuthBoundary({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    getCurrentUser().then((result) => {
      if (result.status === 'authenticated') {
        setUser(result.user);
        setStatus('ready');
      } else if (result.status === 'unauthenticated') {
        router.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      } else {
        setMessage(result.message);
        setStatus('error');
      }
    });
  }, [router]);

  if (status === 'loading') return <LoadingState />;
  if (status === 'error') return <ErrorState title="Autentikasi belum terhubung" description={message} />;
  if (!user) return <LoadingState label="Mengalihkan ke halaman masuk" />;
  return <>{children}</>;
}
