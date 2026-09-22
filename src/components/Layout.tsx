import type { ReactNode } from 'react';

// Wraps scrolling page content (menu, 404); the shared header lives in AppShell.
export function Layout({ children }: { children: ReactNode }) {
    return <div className="page"><div className="page__content">{children}</div></div>;
}
