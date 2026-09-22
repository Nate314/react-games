import { useRef, type ReactNode } from 'react';
import { useStageSize, type StageSize } from '../stage';

// Measures its own box and hands the size to the game as a prop.
export function StageHost({ children }: { children: (stage: StageSize) => ReactNode }) {
    const ref = useRef<HTMLDivElement>(null);
    const stage = useStageSize(ref);
    return <div className="stage-host" ref={ref}>{children(stage)}</div>;
}
