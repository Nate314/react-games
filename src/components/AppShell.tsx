import { useEffect, useState, type ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { routeTitle } from '../games/registry';
import { AppHeader, type BackTarget } from './AppHeader';

const HOME_BACK: BackTarget = { label: 'nathangawith.com', to: 'https://nathangawith.com', external: true };
const MENU_BACK: BackTarget = { label: 'Games', to: '/' };

export function AppShell({ children }: { children: ReactNode }) {
    const { pathname } = useLocation();
    const [maximized, setMaximized] = useState(false);
    useEffect(() => setMaximized(false), [pathname]);

    const gameTitle = routeTitle(pathname);
    const isHome = pathname === '/';
    const pageName = isHome ? 'Games' : gameTitle ?? 'Not Found';
    const back = isHome ? HOME_BACK : MENU_BACK;
    const showMaximized = maximized && gameTitle !== null;

    return (
        <div className="app-shell">
            {showMaximized
                ? <button type="button" className="restore-button" aria-label="Restore header" title="Restore header" onClick={() => setMaximized(false)}>⤡</button>
                : <AppHeader pageName={pageName} back={back} onMaximize={gameTitle !== null ? () => setMaximized(true) : undefined} />}
            <main className="stage">{children}</main>
        </div>
    );
}
