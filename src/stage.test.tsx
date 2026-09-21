import { act, render, screen } from '@testing-library/react';
import { useRef } from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { useStageSize } from './stage';

let callback: ResizeObserverCallback = () => {};
const disconnect = vi.fn();

class FakeObserver {
    constructor(cb: ResizeObserverCallback) { callback = cb; }
    observe() {}
    unobserve() {}
    disconnect = disconnect;
}

function Probe() {
    const ref = useRef<HTMLDivElement>(null);
    const { width, height } = useStageSize(ref);
    return <div ref={ref}>{width}x{height}</div>;
}

const entry = (width: number, height: number) => [{ contentRect: { width, height } } as ResizeObserverEntry];

afterEach(() => vi.unstubAllGlobals());

describe('useStageSize', () => {
    it('falls back to the window size when the element has no size', () => {
        vi.stubGlobal('ResizeObserver', FakeObserver);
        render(<Probe />);
        expect(screen.getByText(`${window.innerWidth}x${window.innerHeight}`)).toBeInTheDocument();
    });

    it('reports the observed size and updates on callback', () => {
        vi.stubGlobal('ResizeObserver', FakeObserver);
        render(<Probe />);
        act(() => callback(entry(300, 200), {} as ResizeObserver));
        expect(screen.getByText('300x200')).toBeInTheDocument();
        act(() => callback(entry(640, 480), {} as ResizeObserver));
        expect(screen.getByText('640x480')).toBeInTheDocument();
    });

    it('disconnects on unmount', () => {
        vi.stubGlobal('ResizeObserver', FakeObserver);
        render(<Probe />).unmount();
        expect(disconnect).toHaveBeenCalled();
    });
});
