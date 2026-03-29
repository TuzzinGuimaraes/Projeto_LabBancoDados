import React, { useEffect, useRef, useState } from 'react';
import { Shield, Star, Trash2, Users } from 'lucide-react';

const AdminTab = ({
    permissions,
    usuarios,
    avaliacoesModeracao,
    onCarregarUsuarios,
    onAlterarStatusUsuario,
    onCarregarAvaliacoes,
    onDeletarAvaliacao
}) => {
    const [activeAdminTab, setActiveAdminTab] = useState('usuarios');
    const hasLoadedRef = useRef({ usuarios: false, avaliacoes: false });

    useEffect(() => {
        if (activeAdminTab === 'usuarios' && !hasLoadedRef.current.usuarios) {
            hasLoadedRef.current.usuarios = true;
            onCarregarUsuarios();
        } else if (activeAdminTab === 'avaliacoes' && !hasLoadedRef.current.avaliacoes) {
            hasLoadedRef.current.avaliacoes = true;
            onCarregarAvaliacoes();
        }
    }, [activeAdminTab, onCarregarUsuarios, onCarregarAvaliacoes]);

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <Shield className="text-purple-600" />
                Painel de {permissions?.nivel_acesso === 'admin' ? 'Administração' : 'Moderação'}
            </h2>

            <div className="flex gap-2 mb-6">
                <button
                    onClick={() => setActiveAdminTab('usuarios')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        activeAdminTab === 'usuarios'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    <Users className="inline mr-2" size={20} />
                    Usuários
                </button>
                <button
                    onClick={() => setActiveAdminTab('avaliacoes')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        activeAdminTab === 'avaliacoes'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    <Star className="inline mr-2" size={20} />
                    Avaliações
                </button>
            </div>

            {activeAdminTab === 'usuarios' && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold mb-4">Gerenciar Usuários</h3>
                    <div className="space-y-4">
                        {usuarios.map(usuario => (
                            <div key={usuario.id_usuario} className="border rounded-lg p-4 flex items-center justify-between">
                                <div>
                                    <h4 className="font-bold">{usuario.nome_completo}</h4>
                                    <p className="text-sm text-gray-600">{usuario.email}</p>
                                    <p className="text-xs text-gray-500">
                                        Grupos: {usuario.grupos || 'Nenhum'} |
                                        Mídias: {usuario.total_midias || usuario.total_animes || 0} |
                                        Avaliações: {usuario.total_avaliacoes}
                                    </p>
                                </div>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => onAlterarStatusUsuario(usuario.id_usuario, !usuario.ativo)}
                                        className={`px-4 py-2 rounded-lg font-medium ${
                                            usuario.ativo
                                                ? 'bg-red-500 text-white hover:bg-red-600'
                                                : 'bg-green-500 text-white hover:bg-green-600'
                                        }`}
                                    >
                                        {usuario.ativo ? 'Desativar' : 'Ativar'}
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {activeAdminTab === 'avaliacoes' && (
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <h3 className="text-xl font-bold mb-4">Moderar Avaliações</h3>
                    <div className="space-y-4">
                        {avaliacoesModeracao.map(avaliacao => (
                            <div key={avaliacao.id_avaliacao} className="border rounded-lg p-4">
                                <div className="flex items-start justify-between mb-2">
                                    <div>
                                        <h4 className="font-bold">{avaliacao.titulo_avaliacao || 'Sem título'}</h4>
                                        <p className="text-sm text-gray-600">
                                            Por: {avaliacao.nome_completo} |
                                            Tipo: {avaliacao.tipo} |
                                            Título: {avaliacao.titulo_portugues || avaliacao.titulo_original} |
                                            Nota: ⭐ {avaliacao.nota}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => onDeletarAvaliacao(avaliacao.id_avaliacao)}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 size={20} />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-700">{avaliacao.texto_avaliacao}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminTab;
