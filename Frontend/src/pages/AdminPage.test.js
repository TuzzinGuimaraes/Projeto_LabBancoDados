import React from 'react';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';

import AdminPage from './AdminPage';

jest.mock('../contexts/ApiContext', () => ({
    useApi: jest.fn(),
}));

jest.mock('../contexts/AuthContext', () => ({
    useAuth: jest.fn(),
}));

const { useApi } = require('../contexts/ApiContext');
const { useAuth } = require('../contexts/AuthContext');


describe('AdminPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('carrega usuarios e avaliacoes quando autorizado', async () => {
        const apiCall = jest.fn()
            .mockResolvedValueOnce({ usuarios: [{ id_usuario: 'USR-1', nome_completo: 'User 1', email: 'u1@example.com', grupos: 'Usuários', total_midias: 2, total_avaliacoes: 1, ativo: true }] })
            .mockResolvedValueOnce({ avaliacoes: [{ id_avaliacao: 'AVL-1', titulo_avaliacao: 'Boa', nome_completo: 'User 1', tipo: 'anime', titulo_portugues: 'Anime X', nota: 8 }] });
        useApi.mockReturnValue({ apiCall });
        useAuth.mockReturnValue({ permissions: { nivel_acesso: 'admin' } });

        render(<AdminPage />);

        expect(await screen.findByText('User 1')).toBeInTheDocument();
        fireEvent.click(screen.getByRole('button', { name: /Avaliações/ }));
        expect(await screen.findByText('Boa')).toBeInTheDocument();
    });

    test('permite ativar e desativar usuario', async () => {
        const apiCall = jest.fn()
            .mockResolvedValueOnce({ usuarios: [{ id_usuario: 'USR-1', nome_completo: 'User 1', email: 'u1@example.com', grupos: 'Usuários', total_midias: 2, total_avaliacoes: 1, ativo: true }] })
            .mockResolvedValueOnce({})
            .mockResolvedValueOnce({ usuarios: [{ id_usuario: 'USR-1', nome_completo: 'User 1', email: 'u1@example.com', grupos: 'Usuários', total_midias: 2, total_avaliacoes: 1, ativo: false }] });
        useApi.mockReturnValue({ apiCall });
        useAuth.mockReturnValue({ permissions: { nivel_acesso: 'admin' } });

        render(<AdminPage />);

        fireEvent.click(await screen.findByText('Desativar'));

        await waitFor(() => expect(apiCall).toHaveBeenCalledWith('/moderacao/usuarios/USR-1/desativar', { method: 'PUT' }));
        expect(await screen.findByText('Ativar')).toBeInTheDocument();
    });

    test('trata falha de API', async () => {
        useApi.mockReturnValue({ apiCall: jest.fn().mockRejectedValue(new Error('Falhou')) });
        useAuth.mockReturnValue({ permissions: { nivel_acesso: 'admin' } });

        render(<AdminPage />);

        await waitFor(() => expect(window.alert).toHaveBeenCalledWith('Erro: Falhou'));
    });
});
