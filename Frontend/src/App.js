import React, { useState, useEffect, useCallback } from 'react';
import { Star, TrendingUp } from 'lucide-react';


// Components
import LoginForm from './components/LoginForm';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import AnimeCard from './components/AnimeCard';
import MinhaListaTab from './components/MinhaListaTab';
import EstatisticasTab from './components/EstatisticasTab';
import NoticiasTab from './components/NoticiasTab';
import AdminTab from './components/AdminTab';
import EditAnimeModal from './components/EditAnimeModal';
import CreateNoticiaModal from './components/CreateNoticiaModal';
import AvaliacaoModal from './components/AvaliacaoModal';
import AnimeDetalhesModal from './components/AnimeDetalhesModal';
import CriarAtualizacaoModal from './components/CriarAtualizacaoModal';
import LoadingSpinner from './components/LoadingSpinner';

// Configuração da API
const API_URL = 'http://localhost:5000/api';

function App() {
    const [user, setUser] = useState(null);
    const [permissions, setPermissions] = useState(null);
    const [activeTab, setActiveTab] = useState('home');
    const [animes, setAnimes] = useState([]);
    const [minhaLista, setMinhaLista] = useState([]);
    const [notificacoes, setNotificacoes] = useState([]);
    const [showMobileMenu, setShowMobileMenu] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [estatisticas, setEstatisticas] = useState(null);
    const [noticias, setNoticias] = useState([]);

    // Estados de administração
    const [usuarios, setUsuarios] = useState([]);
    const [avaliacoesModeracao, setAvaliacoesModeracao] = useState([]);

    // Estado para modal de edição
    const [editModalOpen, setEditModalOpen] = useState(false);
    const [animeToEdit, setAnimeToEdit] = useState(null);

    // Estado para modal de criar notícia
    const [createNoticiaModalOpen, setCreateNoticiaModalOpen] = useState(false);

    // Estado para modal de avaliação
    const [avaliacaoModalOpen, setAvaliacaoModalOpen] = useState(false);
    const [animeToAvaliar, setAnimeToAvaliar] = useState(null);

    // Estado para modal de detalhes do anime
    const [detalhesModalOpen, setDetalhesModalOpen] = useState(false);
    const [animeDetalhes, setAnimeDetalhes] = useState(null);

    // Estado para modal de criar atualização
    const [atualizacaoModalOpen, setAtualizacaoModalOpen] = useState(false);
    const [animeParaAtualizar, setAnimeParaAtualizar] = useState(null);

    // Função de logout (sem dependências para evitar loops)
    const handleLogout = useCallback(async () => {
        const token = localStorage.getItem('token');
        
        // Tentar revogar o token no backend
        if (token) {
            try {
                await fetch(`${API_URL}/auth/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });
            } catch (error) {
                console.error('Erro ao revogar token:', error);
                // Continua com o logout mesmo se a revogação falhar
            }
        }

        // Limpar dados locais
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        localStorage.removeItem('permissions');
        setUser(null);
        setPermissions(null);
        setMinhaLista([]);
        setNotificacoes([]);
        setEstatisticas(null);
        setActiveTab('home');
    }, []);

    // Funções de API
    const apiCall = useCallback(async (endpoint, options = {}) => {
        const token = localStorage.getItem('token');
        const headers = {
            'Content-Type': 'application/json',
            ...(token && { 'Authorization': `Bearer ${token}` })
        };

        try {
            const response = await fetch(`${API_URL}${endpoint}`, {
                ...options,
                headers: { ...headers, ...options.headers }
            });

            // Verifica se a resposta é JSON antes de tentar fazer parse
            const contentType = response.headers.get('content-type');
            let data;
            
            if (contentType && contentType.includes('application/json')) {
                data = await response.json();
            } else {
                data = { erro: 'Resposta inválida do servidor' };
            }

            // Token inválido, expirado ou revogado - fazer logout automático
            if (response.status === 401 || response.status === 422) {
                console.warn('Token inválido ou expirado. Fazendo logout automático...');
                await handleLogout();
                throw new Error('Sessão expirada. Por favor, faça login novamente.');
            }

            if (!response.ok) {
                throw new Error(data.erro || data.msg || 'Erro na requisição');
            }

            return data;
        } catch (error) {
            // Se for erro de rede ou outro erro não relacionado a autenticação
            if (error.message.includes('Failed to fetch')) {
                console.error('Erro de conexão com a API:', error);
                throw new Error('Erro de conexão com o servidor. Verifique sua conexão.');
            }
            
            console.error('Erro na API:', error);
            throw error;
        }
    }, [handleLogout]);

    const carregarDados = useCallback(async () => {
        setLoading(true);
        try {
            const promises = [
                apiCall('/animes?por_pagina=500&ordem=nota_media'), // Aumentar limite para pegar todos
                apiCall('/lista'),
                apiCall('/notificacoes?nao_lidas=true'),
                apiCall('/generos'),
            ];

            const token = localStorage.getItem('token');
            if (token) {
                promises.push(apiCall('/usuario/estatisticas'));
                promises.push(apiCall('/noticias?limite=10'));
            }

            const results = await Promise.all(promises.map(p => p.catch(() => null)));

            setAnimes(results[0]?.animes || []);
            setMinhaLista(results[1]?.lista || []);
            setNotificacoes(results[2]?.notificacoes || []);

            if (results[4]) setEstatisticas(results[4]?.estatisticas);
            if (results[5]) setNoticias(results[5]?.noticias || []);
        } catch (error) {
            console.error('Erro ao carregar dados:', error);
        }
        setLoading(false);
    }, [apiCall]); // eslint-disable-line react-hooks/exhaustive-deps

    // Função para buscar animes no backend com debounce
    const buscarAnimesBackend = useCallback(async (termo) => {
        if (!termo || termo.length < 2) {
            // Se não há termo, recarrega todos os animes
            carregarDados();
            return;
        }

        setLoading(true);
        try {
            const data = await apiCall(`/animes?busca=${encodeURIComponent(termo)}&por_pagina=500`);
            setAnimes(data?.animes || []);
        } catch (error) {
            console.error('Erro ao buscar animes:', error);
        }
        setLoading(false);
    }, [apiCall, carregarDados]);

    useEffect(() => {
        const token = localStorage.getItem('token');
        const userData = localStorage.getItem('user');
        const userPermissions = localStorage.getItem('permissions');

        if (token && userData) {
            // Validar token fazendo uma requisição ao backend
            const validateToken = async () => {
                try {
                    await apiCall('/auth/me');
                    // Token válido, carregar dados do usuário
                    setUser(JSON.parse(userData));
                    if (userPermissions) {
                        setPermissions(JSON.parse(userPermissions));
                    }
                    carregarDados();
                } catch (error) {
                    // Token inválido - handleLogout já foi chamado pelo apiCall
                    console.warn('Token inválido na inicialização');
                }
            };
            
            validateToken();
        }
    }, [apiCall, carregarDados]);

    // Carregar notícias quando a aba de notícias for selecionada
    useEffect(() => {
        const carregarNoticias = async () => {
            if (activeTab === 'noticias' && noticias.length === 0) {
                try {
                    const data = await apiCall('/noticias?limite=10');
                    setNoticias(data?.noticias || []);
                } catch (error) {
                    console.error('Erro ao carregar notícias:', error);
                }
            }
        };

        carregarNoticias();
    }, [activeTab, apiCall, noticias.length]);

    const handleLogin = async (email, senha) => {
        try {
            const data = await apiCall('/auth/login', {
                method: 'POST',
                body: JSON.stringify({ email, senha })
            });

            localStorage.setItem('token', data.access_token);
            localStorage.setItem('user', JSON.stringify(data.usuario));
            localStorage.setItem('permissions', JSON.stringify(data.usuario.permissoes));

            setUser(data.usuario);
            setPermissions(data.usuario.permissoes);
            carregarDados();
            return { success: true };
        } catch (error) {
            return { success: false, error: error.message };
        }
    };

    const handleRegistro = async (formData) => {
        try {
            await apiCall('/auth/registro', {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            return await handleLogin(formData.email, formData.senha);
        } catch (error) {
            return { success: false, error: error.message };
        }
    };


    const adicionarAnimeLista = async (animeId, status = 'planejado') => {
        try {
            await apiCall('/lista/adicionar', {
                method: 'POST',
                body: JSON.stringify({ id_anime: animeId, status })
            });

            carregarDados();
            alert('Anime adicionado à sua lista!');
        } catch (error) {
            alert('Erro: ' + error.message);
        }
    };

    const atualizarItemLista = async (listaId, dados) => {
        try {
            await apiCall(`/lista/${listaId}`, {
                method: 'PUT',
                body: JSON.stringify(dados)
            });

            carregarDados();
        } catch (error) {
            alert('Erro ao atualizar: ' + error.message);
        }
    };

    const removerItemLista = async (listaId) => {
        if (!window.confirm('Deseja remover este anime da sua lista?')) return;

        try {
            await apiCall(`/lista/${listaId}`, {
                method: 'DELETE'
            });

            carregarDados();
            alert('Anime removido da lista!');
        } catch (error) {
            alert('Erro ao remover: ' + error.message);
        }
    };

    const marcarNotificacoesLidas = async () => {
        try {
            await apiCall('/notificacoes/marcar-todas-lidas', {
                method: 'PUT'
            });
            setNotificacoes([]);
        } catch (error) {
            console.error('Erro ao marcar notificações:', error);
        }
    };

    // Funções de administração
    const carregarUsuarios = useCallback(async () => {
        try {
            const data = await apiCall('/moderacao/usuarios');
            setUsuarios(data.usuarios || []);
        } catch (error) {
            alert('Erro ao carregar usuários: ' + error.message);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const alterarStatusUsuario = useCallback(async (userId, ativar) => {
        try {
            const endpoint = ativar ? 'ativar' : 'desativar';
            await apiCall(`/moderacao/usuarios/${userId}/${endpoint}`, {
                method: 'PUT'
            });
            carregarUsuarios();
            alert(`Usuário ${ativar ? 'ativado' : 'desativado'} com sucesso!`);
        } catch (error) {
            alert('Erro: ' + error.message);
        }
    }, [carregarUsuarios]); // eslint-disable-line react-hooks/exhaustive-deps

    const carregarAvaliacoesModeracao = useCallback(async () => {
        try {
            const data = await apiCall('/moderacao/avaliacoes');
            setAvaliacoesModeracao(data.avaliacoes || []);
        } catch (error) {
            alert('Erro ao carregar avaliações: ' + error.message);
        }
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const deletarAvaliacao = useCallback(async (avaliacaoId) => {
        if (!window.confirm('Deseja deletar esta avaliação?')) return;

        try {
            await apiCall(`/avaliacoes/${avaliacaoId}`, {
                method: 'DELETE'
            });
            carregarAvaliacoesModeracao();
            alert('Avaliação deletada!');
        } catch (error) {
            alert('Erro: ' + error.message);
        }
    }, [carregarAvaliacoesModeracao]); // eslint-disable-line react-hooks/exhaustive-deps

    // Funções de edição de anime
    const abrirModalEdicao = (anime) => {
        setAnimeToEdit(anime);
        setEditModalOpen(true);
    };

    const fecharModalEdicao = () => {
        setEditModalOpen(false);
        setAnimeToEdit(null);
    };

    const salvarEdicaoAnime = async (animeId, dados) => {
        try {
            await apiCall(`/animes/${animeId}`, {
                method: 'PUT',
                body: JSON.stringify(dados)
            });

            await carregarDados();
            alert('Anime atualizado com sucesso!');
        } catch (error) {
            throw new Error(error.message || 'Erro ao atualizar anime');
        }
    };

    const deletarAnime = async (animeId) => {
        if (!window.confirm('Deseja deletar este anime?')) return;

        try {
            await apiCall(`/animes/${animeId}`, {
                method: 'DELETE'
            });
            carregarDados();
            alert('Anime deletado com sucesso!');
        } catch (error) {
            alert('Erro: ' + error.message);
        }
    };

    // Funções de notícias
    const abrirModalCriarNoticia = () => {
        setCreateNoticiaModalOpen(true);
    };

    const fecharModalCriarNoticia = () => {
        setCreateNoticiaModalOpen(false);
    };

    const criarNoticia = async (dados) => {
        try {
            await apiCall('/noticias', {
                method: 'POST',
                body: JSON.stringify(dados)
            });

            // Recarregar notícias
            await carregarDados();
            alert('Notícia criada com sucesso!');
        } catch (error) {
            throw new Error(error.message || 'Erro ao criar notícia');
        }
    };

    // Funções de avaliação
    const abrirModalAvaliacao = (anime) => {
        setAnimeToAvaliar(anime);
        setAvaliacaoModalOpen(true);
    };

    const fecharModalAvaliacao = () => {
        setAvaliacaoModalOpen(false);
        setAnimeToAvaliar(null);
    };

    const criarAvaliacao = async (animeId, dados) => {
        try {
            await apiCall('/avaliacoes', {
                method: 'POST',
                body: JSON.stringify({
                    id_anime: animeId,
                    ...dados
                })
            });

            // Recarregar dados
            await carregarDados();
            alert('Avaliação publicada com sucesso!');
        } catch (error) {
            throw new Error(error.message || 'Erro ao criar avaliação');
        }
    };

    // Funções de detalhes do anime
    const abrirDetalhesAnime = (anime) => {
        setAnimeDetalhes(anime);
        setDetalhesModalOpen(true);
    };

    const fecharDetalhesAnime = () => {
        setDetalhesModalOpen(false);
        setAnimeDetalhes(null);
    };

    // Funções de criar atualização (moderadores/admins)
    const abrirModalAtualizacao = (anime) => {
        setAnimeParaAtualizar(anime);
        setAtualizacaoModalOpen(true);
        setDetalhesModalOpen(false); // Fecha a modal de detalhes
    };

    const fecharModalAtualizacao = () => {
        setAtualizacaoModalOpen(false);
        setAnimeParaAtualizar(null);
    };

    const handleAtualizacaoSuccess = async () => {
        // Recarregar notificações e dados
        await carregarDados();
    };

    // Implementar debounce na busca
    useEffect(() => {
        const timer = setTimeout(() => {
            if (activeTab === 'catalogo') {
                buscarAnimesBackend(searchTerm);
            }
        }, 500); // Aguarda 500ms após o usuário parar de digitar

        return () => clearTimeout(timer);
    }, [searchTerm, activeTab, buscarAnimesBackend]);

    // Interface principal
    if (!user) {
        return <LoginForm onLogin={handleLogin} onRegistro={handleRegistro} />;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header
                user={user}
                permissions={permissions}
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                notificacoes={notificacoes}
                onLogout={handleLogout}
                onMarcarNotificacoesLidas={marcarNotificacoesLidas}
                showMobileMenu={showMobileMenu}
                setShowMobileMenu={setShowMobileMenu}
            />

            {/* Barra de pesquisa apenas nas abas relevantes */}
            {(activeTab === 'home' || activeTab === 'minha-lista') && (
                <SearchBar searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
            )}

            {/* Barra de pesquisa especial do Catálogo */}
            {activeTab === 'catalogo' && (
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 py-6 shadow-lg">
                    <div className="container mx-auto px-4">
                        <SearchBar
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            placeholder="Buscar anime por título ou sinopse..."
                        />
                        <p className="text-white text-center mt-2 text-sm">
                            {loading ? 'Buscando...' : `${animes.length} anime(s) encontrado(s)`}
                        </p>
                    </div>
                </div>
            )}

            <main className="container mx-auto px-4 py-8">
                {loading && activeTab !== 'catalogo' ? (
                    <LoadingSpinner />
                ) : (
                    <>
                        {activeTab === 'home' && (
                            <div>
                                <div className="mb-8">
                                    <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                                        <Star className="text-yellow-500" fill="currentColor" />
                                        Destaques da Semana
                                    </h2>
                                    <p className="text-gray-600">Os animes com maior pontuação da nossa comunidade</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                                    {animes
                                        .sort((a, b) => (b?.nota_media || 0) - (a?.nota_media || 0))
                                        .slice(0, 8)
                                        .map(anime => (
                                            <AnimeCard
                                                key={anime.id_anime}
                                                anime={anime}
                                                showActions={permissions?.pode_moderar || permissions?.nivel_acesso === 'admin'}
                                                onAdd={adicionarAnimeLista}
                                                onEdit={abrirModalEdicao}
                                                onDelete={deletarAnime}
                                                onViewDetails={abrirDetalhesAnime}
                                                isInList={minhaLista.some(item => item.id_anime === anime.id_anime)}
                                                permissions={permissions}
                                            />
                                        ))}
                                </div>

                                <div className="mb-8">
                                    <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
                                        <TrendingUp className="text-purple-600" />
                                        Lançamentos Recentes
                                    </h2>
                                    <p className="text-gray-600">Os últimos animes adicionados ao catálogo</p>
                                </div>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                    {animes
                                        .sort((a, b) => new Date(b?.data_lancamento || 0) - new Date(a?.data_lancamento || 0))
                                        .slice(0, 8)
                                        .map(anime => (
                                            <AnimeCard
                                                key={anime.id_anime}
                                                anime={anime}
                                                showActions={permissions?.pode_moderar || permissions?.nivel_acesso === 'admin'}
                                                onAdd={adicionarAnimeLista}
                                                onEdit={abrirModalEdicao}
                                                onDelete={deletarAnime}
                                                onViewDetails={abrirDetalhesAnime}
                                                isInList={minhaLista.some(item => item.id_anime === anime.id_anime)}
                                                permissions={permissions}
                                            />
                                        ))}
                                </div>
                            </div>
                        )}

                        {activeTab === 'catalogo' && (
                            <div>
                                <div className="mb-6 flex justify-between items-center">
                                    <h2 className="text-3xl font-bold">Catálogo Completo</h2>
                                    {!loading && (
                                        <span className="text-gray-600">
                                            {animes.length} anime(s)
                                        </span>
                                    )}
                                </div>

                                {loading ? (
                                    <LoadingSpinner />
                                ) : animes.length === 0 ? (
                                    <div className="text-center py-12">
                                        <p className="text-gray-500 text-lg">
                                            {searchTerm ? 'Nenhum anime encontrado com essa busca' : 'Nenhum anime disponível'}
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                        {animes.map(anime => (
                                            <AnimeCard
                                                key={anime.id_anime}
                                                anime={anime}
                                                showActions={permissions?.pode_moderar || permissions?.nivel_acesso === 'admin'}
                                                onAdd={adicionarAnimeLista}
                                                onEdit={abrirModalEdicao}
                                                onDelete={deletarAnime}
                                                onViewDetails={abrirDetalhesAnime}
                                                isInList={minhaLista.some(item => item.id_anime === anime.id_anime)}
                                                permissions={permissions}
                                            />
                                        ))}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'minha-lista' && (
                            <div>
                                <h2 className="text-3xl font-bold mb-6">Minha Lista</h2>
                                <MinhaListaTab
                                    minhaLista={minhaLista}
                                    onUpdate={atualizarItemLista}
                                    onRemove={removerItemLista}
                                    onAvaliar={abrirModalAvaliacao}
                                    onViewDetails={abrirDetalhesAnime}
                                />
                            </div>
                        )}


                        {activeTab === 'estatisticas' && <EstatisticasTab estatisticas={estatisticas} />}

                        {activeTab === 'noticias' && (
                            <NoticiasTab
                                noticias={noticias}
                                permissions={permissions}
                                onCreateNoticia={abrirModalCriarNoticia}
                            />
                        )}

                        {activeTab === 'admin' && (permissions?.pode_moderar || permissions?.nivel_acesso === 'admin') && (
                            <AdminTab
                                permissions={permissions}
                                usuarios={usuarios}
                                avaliacoesModeracao={avaliacoesModeracao}
                                onCarregarUsuarios={carregarUsuarios}
                                onAlterarStatusUsuario={alterarStatusUsuario}
                                onCarregarAvaliacoes={carregarAvaliacoesModeracao}
                                onDeletarAvaliacao={deletarAvaliacao}
                            />
                        )}
                    </>
                )}
            </main>

            <EditAnimeModal
                anime={animeToEdit}
                isOpen={editModalOpen}
                onClose={fecharModalEdicao}
                onSave={salvarEdicaoAnime}
            />

            <CreateNoticiaModal
                isOpen={createNoticiaModalOpen}
                onClose={fecharModalCriarNoticia}
                onSave={criarNoticia}
                userName={user?.nome}
            />

            <AvaliacaoModal
                isOpen={avaliacaoModalOpen}
                onClose={fecharModalAvaliacao}
                onSave={criarAvaliacao}
                anime={animeToAvaliar}
            />

            <AnimeDetalhesModal
                isOpen={detalhesModalOpen}
                onClose={fecharDetalhesAnime}
                anime={animeDetalhes}
                onAvaliar={abrirModalAvaliacao}
                apiCall={apiCall}
                isInList={animeDetalhes ? minhaLista.some(item => item.id_anime === animeDetalhes.id_anime) : false}
                permissions={permissions}
                onCriarAtualizacao={abrirModalAtualizacao}
            />

            <CriarAtualizacaoModal
                isOpen={atualizacaoModalOpen}
                onClose={fecharModalAtualizacao}
                anime={animeParaAtualizar}
                apiCall={apiCall}
                onSuccess={handleAtualizacaoSuccess}
            />
        </div>
    );
}

export default App;
