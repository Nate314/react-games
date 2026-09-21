import type { ReactNode } from 'react';
import '../styles/hud.css';

export interface HudStat { label: string; value: string | number }
export interface HudStatus { text: string; tone: 'info' | 'danger' }
// A control becomes a button only when it has an action to run.
export interface HudControl { keys: string; action: string; onSelect?: () => void }

interface GameHudProps {
    controls: HudControl[];
    stats?: HudStat[];
    status?: HudStatus | null;
    footer?: ReactNode;
    variant?: 'panel' | 'overlay';
}

function Control({ keys, action, onSelect }: HudControl) {
    const content = (<><kbd className="hud__key">{keys}</kbd><span>{action}</span></>);
    return onSelect
        ? <button type="button" className="hud__control hud__control--button" onClick={onSelect}>{content}</button>
        : <span className="hud__control">{content}</span>;
}

export function GameHud({ controls, stats = [], status = null, footer, variant = 'panel' }: GameHudProps) {
    return (
        <section
            className={`hud hud--${variant}`}
            role="group"
            aria-label="Game status and controls"
        >
            {(stats.length > 0 || status) && (
                <div className="hud__row">
                    {stats.map(stat => (
                        <span className="hud__stat" key={stat.label}>
                            <span className="hud__label">{stat.label}</span>
                            <span className="hud__value">{stat.value}</span>
                        </span>
                    ))}
                    {status && <span role="status" className={`hud__status hud__status--${status.tone}`}>{status.text}</span>}
                </div>
            )}
            <div className="hud__row hud__row--controls">
                {controls.map(control => <Control key={control.keys} {...control} />)}
            </div>
            {footer && <div className="hud__footer">{footer}</div>}
        </section>
    );
}
