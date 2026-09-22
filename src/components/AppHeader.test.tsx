import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it, vi } from 'vitest';
import '@testing-library/jest-dom/vitest';
import { AppHeader } from './AppHeader';

const internal = { label: 'Games', to: '/' };
const external = { label: 'nathangawith.com', to: 'https://nathangawith.com', external: true };

const renderHeader = (ui: React.ReactElement) => render(<MemoryRouter>{ui}</MemoryRouter>);

describe('AppHeader', () => {
    it('renders the title with the brand prefix', () => {
        renderHeader(<AppHeader pageName="Snake" back={internal} />);
        expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Nathan Gawith | Snake');
    });

    it('internal back is a router link', () => {
        renderHeader(<AppHeader pageName="Snake" back={internal} />);
        expect(screen.getByRole('link', { name: 'Games' })).toHaveAttribute('href', '/');
    });

    it('external back is a plain anchor', () => {
        renderHeader(<AppHeader pageName="Games" back={external} />);
        expect(screen.getByRole('link', { name: 'nathangawith.com' })).toHaveAttribute('href', 'https://nathangawith.com');
    });

    it('shows maximize only when a handler is given', () => {
        const onMaximize = vi.fn();
        const { unmount } = renderHeader(<AppHeader pageName="Snake" back={internal} onMaximize={onMaximize} />);
        fireEvent.click(screen.getByRole('button', { name: 'Maximize' }));
        expect(onMaximize).toHaveBeenCalledOnce();
        unmount();
        renderHeader(<AppHeader pageName="Games" back={external} />);
        expect(screen.queryByRole('button', { name: 'Maximize' })).toBeNull();
    });

    it('contains the theme toggle', () => {
        renderHeader(<AppHeader pageName="Games" back={external} />);
        expect(screen.getByRole('button', { name: /switch to/i })).toBeInTheDocument();
    });
});
