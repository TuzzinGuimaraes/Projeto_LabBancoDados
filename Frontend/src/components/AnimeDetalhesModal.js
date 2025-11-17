import React, { useState, useEffect, useCallback } from 'react';
import { X, Star, Calendar, Film, TrendingUp, MessageSquare, User, Bell } from 'lucide-react';

const AnimeDetalhesModal = ({ isOpen, onClose, anime, onAvaliar, apiCall, isInList, permissions, onCriarAtualizacao }) => {
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [loading, setLoading] = useState(false);

    const carregarAvaliacoes = useCallback(async () => {
        if (!anime) return;

        setLoading(true);
        try {
            const data = await apiCall(`/avaliacoes/${anime.id_anime}`);
            setAvaliacoes(data.avaliacoes || []);
        } catch (error) {
            console.error('Erro ao carregar avaliações:', error);
            setAvaliacoes([]);
        } finally {
            setLoading(false);
        }
    }, [anime, apiCall]);

    useEffect(() => {
        if (isOpen && anime) {
            carregarAvaliacoes();
        }
    }, [isOpen, anime, carregarAvaliacoes]);

    if (!isOpen || !anime) return null;

    const avaliacoesPrincipais = avaliacoes
        .sort((a, b) => b.nota - a.nota)
        .slice(0, 5);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto my-8">
                {/* Header com imagem de fundo */}
                <div className="relative h-64 rounded-t-2xl overflow-hidden">
                    <img
                        src={anime.banner_url || anime.poster_url || 'https://via.placeholder.com/1200x400?text=Anime'}
                        alt={anime.titulo_portugues}
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />

                    <button
                        onClick={onClose}
                        className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-lg transition-all backdrop-blur-sm"
                    >
                        <X size={24} className="text-white" />
                    </button>

                    <div className="absolute bottom-4 left-4 right-4">
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {anime.titulo_portugues || anime.titulo_original}
                        </h1>
                        {anime.titulo_original && anime.titulo_portugues !== anime.titulo_original && (
                            <p className="text-lg text-gray-200">{anime.titulo_original}</p>
                        )}
                    </div>
                </div>

                {/* Conteúdo */}
                <div className="p-6 space-y-6">
                    {/* Informações principais */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-purple-50 rounded-lg p-4 text-center">
                            <Star className="mx-auto mb-2 text-yellow-500" size={24} fill="currentColor" />
                            <p className="text-2xl font-bold text-purple-600">
                                {anime.nota_media ? Number(anime.nota_media).toFixed(1) : 'N/A'}
                            </p>
                            <p className="text-xs text-gray-600">Nota Média</p>
                        </div>

                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                            <Film className="mx-auto mb-2 text-blue-500" size={24} />
                            <p className="text-2xl font-bold text-blue-600">
                                {anime.numero_episodios || '?'}
                            </p>
                            <p className="text-xs text-gray-600">Episódios</p>
                        </div>

                        <div className="bg-green-50 rounded-lg p-4 text-center">
                            <TrendingUp className="mx-auto mb-2 text-green-500" size={24} />
                            <p className="text-lg font-bold text-green-600 capitalize">
                                {anime.status_anime || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-600">Status</p>
                        </div>

                        <div className="bg-orange-50 rounded-lg p-4 text-center">
                            <MessageSquare className="mx-auto mb-2 text-orange-500" size={24} />
                            <p className="text-2xl font-bold text-orange-600">
                                {avaliacoes.length}
                            </p>
                            <p className="text-xs text-gray-600">Avaliações</p>
                        </div>
                    </div>

                    {/* Data de lançamento */}
                    {anime.data_lancamento && (
                        <div className="flex items-center gap-2 text-gray-600">
                            <Calendar size={20} />
                            <span>
                                Lançamento: {new Date(anime.data_lancamento).toLocaleDateString('pt-BR')}
                            </span>
                        </div>
                    )}

                    {/* Sinopse */}
                    <div>
                        <h3 className="text-xl font-bold mb-2 text-gray-800">Sinopse</h3>
                        <p className="text-gray-700 leading-relaxed">
                            {anime.sinopse || 'Sem sinopse disponível.'}
                        </p>
                    </div>

                    {/* Botão de avaliar (se estiver na lista) */}
                    {isInList && onAvaliar && (
                        <button
                            onClick={() => {
                                onClose();
                                onAvaliar(anime);
                            }}
                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
                        >
                            <MessageSquare size={20} />
                            Avaliar este Anime
                        </button>
                    )}

                    {/* Botão de criar atualização (apenas moderadores/admins) */}
                    {(permissions?.pode_moderar || permissions?.nivel_acesso === 'admin') && onCriarAtualizacao && (
                        <button
                            onClick={() => onCriarAtualizacao(anime)}
                            className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all flex items-center justify-center gap-2 shadow-lg"
                        >
                            <Bell size={20} />
                            Criar Atualização / Notificar Usuários
                        </button>
                    )}

                    {/* Avaliações */}
                    <div>
                        <h3 className="text-xl font-bold mb-4 text-gray-800">
                            {avaliacoes.length > 0 ? 'Principais Avaliações' : 'Avaliações'}
                        </h3>

                        {loading ? (
                            <div className="text-center py-8">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-purple-600 border-t-transparent"></div>
                                <p className="mt-2 text-gray-600">Carregando avaliações...</p>
                            </div>
                        ) : avaliacoesPrincipais.length === 0 ? (
                            <div className="text-center py-8 bg-gray-50 rounded-lg">
                                <MessageSquare size={48} className="mx-auto text-gray-400 mb-2" />
                                <p className="text-gray-500">Nenhuma avaliação ainda.</p>
                                <p className="text-sm text-gray-400 mt-1">
                                    Seja o primeiro a avaliar este anime!
                                </p>
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {avaliacoesPrincipais.map((avaliacao) => (
                                    <div key={avaliacao.id_avaliacao} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                                        <div className="flex items-start justify-between mb-2">
                                            <div className="flex items-center gap-2">
                                                <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                                                    {avaliacao.foto_perfil ? (
                                                        <img
                                                            src={avaliacao.foto_perfil}
                                                            alt={avaliacao.nome_completo}
                                                            className="w-full h-full rounded-full object-cover"
                                                        />
                                                    ) : (
                                                        <User size={20} />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800">
                                                        {avaliacao.nome_completo}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {new Date(avaliacao.data_avaliacao).toLocaleDateString('pt-BR')}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                                                <Star size={16} className="text-yellow-500" fill="currentColor" />
                                                <span className="font-bold text-yellow-700">{avaliacao.nota}</span>
                                            </div>
                                        </div>

                                        {avaliacao.titulo_avaliacao && (
                                            <h4 className="font-semibold text-gray-800 mb-1">
                                                {avaliacao.titulo_avaliacao}
                                            </h4>
                                        )}

                                        {avaliacao.texto_avaliacao && (
                                            <p className="text-gray-700 text-sm leading-relaxed">
                                                {avaliacao.texto_avaliacao.length > 200
                                                    ? `${avaliacao.texto_avaliacao.substring(0, 200)}...`
                                                    : avaliacao.texto_avaliacao}
                                            </p>
                                        )}
                                    </div>
                                ))}

                                {avaliacoes.length > 5 && (
                                    <p className="text-center text-sm text-gray-500 pt-2">
                                        Mostrando 5 de {avaliacoes.length} avaliações
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnimeDetalhesModal;

