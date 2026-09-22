import { useLayoutEffect, useState, type RefObject } from 'react';

export interface StageSize { width: number; height: number }
export interface GameProps { stage: StageSize }

const measure = (element: HTMLElement | null): StageSize =>
    element && element.clientWidth > 0 && element.clientHeight > 0
        ? { width: element.clientWidth, height: element.clientHeight }
        : { width: window.innerWidth, height: window.innerHeight };

const same = (a: StageSize, b: StageSize) => a.width === b.width && a.height === b.height;

// Tracks the size of an element so games never read window sizes directly.
export function useStageSize(ref: RefObject<HTMLElement | null>): StageSize {
    const [size, setSize] = useState<StageSize>(() => measure(ref.current));

    useLayoutEffect(() => {
        const update = (next: StageSize) => setSize(prev => (same(prev, next) ? prev : next));
        update(measure(ref.current));
        const onWindow = () => update(measure(ref.current));
        window.addEventListener('resize', onWindow);
        const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(entries => {
            const rect = entries[entries.length - 1].contentRect;
            update({ width: Math.round(rect.width), height: Math.round(rect.height) });
        });
        if (ref.current) observer?.observe(ref.current);
        return () => {
            window.removeEventListener('resize', onWindow);
            observer?.disconnect();
        };
    }, [ref]);

    return size;
}
