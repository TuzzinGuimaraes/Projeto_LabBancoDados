import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';

import { SessionProvider, useSession } from './SessionContext';


function SessionConsumer() {
    const { sessao, sessaoConfig, setSessao } = useSession();

    return (
        <div>
            <span data-testid="sessao">{sessao}</span>
            <span data-testid="tipos">{sessaoConfig.tipos.join(',')}</span>
            <button onClick={() => setSessao('jogos')}>jogos</button>
            <button onClick={() => setSessao('invalida')}>invalida</button>
        </div>
    );
}


describe('SessionContext', () => {
    beforeEach(() => {
        localStorage.clear();
    });

    test('inicia com animanga por padrao', () => {
        render(
            <SessionProvider>
                <SessionConsumer />
            </SessionProvider>
        );

        expect(screen.getByTestId('sessao')).toHaveTextContent('animanga');
        expect(screen.getByTestId('tipos')).toHaveTextContent('anime,manga');
    });

    test('restaura sessao valida do localStorage', () => {
        localStorage.setItem('medialist_sessao', 'jogos');

        render(
            <SessionProvider>
                <SessionConsumer />
            </SessionProvider>
        );

        expect(screen.getByTestId('sessao')).toHaveTextContent('jogos');
        expect(screen.getByTestId('tipos')).toHaveTextContent('jogo');
    });

    test('troca para jogos e ignora sessao invalida', () => {
        render(
            <SessionProvider>
                <SessionConsumer />
            </SessionProvider>
        );

        fireEvent.click(screen.getByText('jogos'));
        expect(screen.getByTestId('sessao')).toHaveTextContent('jogos');
        expect(localStorage.getItem('medialist_sessao')).toBe('jogos');

        fireEvent.click(screen.getByText('invalida'));
        expect(screen.getByTestId('sessao')).toHaveTextContent('jogos');
    });
});
