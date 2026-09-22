import { Link } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';

export interface BackTarget { label: string; to: string; external?: boolean }

interface AppHeaderProps {
    pageName: string;
    back: BackTarget;
    onMaximize?: () => void;
}

export function AppHeader({ pageName, back, onMaximize }: AppHeaderProps) {
    return (
        <header className="app-header">
            <div className="app-header__side">
                {back.external
                    ? <a className="app-header__back" href={back.to}>{back.label}</a>
                    : <Link className="app-header__back" to={back.to}>{back.label}</Link>}
            </div>
            <h1 className="app-header__title"><span className="app-header__brand">Nathan Gawith | </span>{pageName}</h1>
            <div className="app-header__side app-header__side--end">
                {onMaximize && (
                    <button type="button" className="icon-button" aria-label="Maximize" title="Maximize" onClick={onMaximize}>⛶</button>
                )}
                <ThemeToggle />
            </div>
        </header>
    );
}
