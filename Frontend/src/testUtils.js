import React from 'react';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';

export function renderWithRouter(ui, { route = '/' } = {}) {
    window.history.pushState({}, 'Test', route);
    return render(
        <MemoryRouter initialEntries={[route]}>
            {ui}
        </MemoryRouter>
    );
}
