import type { ReactNode } from 'react';
import { AuthBoundary } from './auth-boundary';
import { Header } from './header';
import { Navigation } from './navigation';

export function AppShell({ children }: { children: ReactNode }) {
  return <AuthBoundary><div className="app-frame"><Navigation /><div className="content-frame"><Header /><main className="main-content">{children}</main></div></div></AuthBoundary>;
}
