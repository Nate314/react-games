import type { ReactNode } from 'react';

export function Layout({ children }: { children: ReactNode }) {
    return (
        <div className="page">
            <main className="page__content">{children}</main>
        </div>
    );
}
