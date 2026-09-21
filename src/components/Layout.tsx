import type { ReactNode } from 'react';
import { ThemeToggle } from './ThemeToggle';

export function Layout({ children }: { children: ReactNode }) {
    return (
        <div className="page">
            <header className="page__header"><ThemeToggle /></header>
            <main className="page__content">{children}</main>
        </div>
    );
}
