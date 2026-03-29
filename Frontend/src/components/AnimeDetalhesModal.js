import React, { useCallback, useEffect, useState } from 'react';
import { Calendar, Film, Gamepad2, MessageSquare, Music4, Star, TrendingUp, User, X } from 'lucide-react';

const tipoIcone = {
    anime: Film,
    manga: Film,
    jogo: Gamepad2,
    musica: Music4
};

const tipoLabel = {
    anime: 'Anime',
    manga: 'Mangá',
    jogo: 'Jogo',
    musica: 'Música'
};

const blocoEspecifico = (midia) => {
    switch (midia.tipo) {
        case 'anime':
            return [
                ['Episódios', midia.numero_episodios || '?'],
                ['Estúdio', midia.estudio || 'Não informado'],
                ['Fonte', midia.fonte_original || 'Não informada'],
                ['Status', midia.status_anime || 'Não informado']
            ];
        case 'manga':
            return [
                ['Capítulos', midia.numero_capitulos || '?'],
                ['Volumes', midia.numero_volumes || '?'],
                ['Autor', midia.autor || 'Não informado'],
                ['Demografia', midia.demografia || 'Não informada']
            ];
        case 'jogo':
            return [
                ['Plataformas', midia.plataformas || 'Não informadas'],
                ['Desenvolvedor', midia.desenvolvedor || 'Não informado'],
                ['Modo', midia.modo_jogo || 'Não informado'],
                ['Status', midia.status_jogo || 'Não informado']
            ];
        case 'musica':
            return [
                ['Artista', midia.musica_artista || 'Não informado'],
                ['Álbum', midia.album || midia.titulo_original],
                ['Faixas', midia.numero_faixas || '?'],
                ['Lançamento', midia.tipo_lancamento || 'Não informado']
            ];
        default:
            return [];
    }
};

const AnimeDetalhesModal = ({ isOpen, onClose, anime, onAvaliar, apiCall, isInList, permissions, onCriarAtualizacao }) => {
    const midia = anime;
    const [avaliacoes, setAvaliacoes] = useState([]);
    const [loading, setLoading] = useState(false);

    const carregarAvaliacoes = useCallback(async () => {
        if (!midia) return;

        setLoading(true);
        try {
            const data = await apiCall(`/avaliacoes/${midia.id_midia}`);
            setAvaliacoes(data.avaliacoes || []);
        } catch (error) {
            console.error('Erro ao carregar avaliações:', error);
            setAvaliacoes([]);
        } finally {
            setLoading(false);
        }
    }, [midia, apiCall]);

    useEffect(() => {
        if (isOpen && midia) {
            carregarAvaliacoes();
        }
    }, [isOpen, midia, carregarAvaliacoes]);

    if (!isOpen || !midia) return null;

    const avaliacoesPrincipais = [...avaliacoes].sort((a, b) => b.nota - a.nota).slice(0, 5);
    const IconeTipo = tipoIcone[midia.tipo] || Film;
    const detalhes = blocoEspecifico(midia);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4 overflow-y-auto">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto my-8">
                <div className="relative h-64 rounded-t-2xl overflow-hidden">
                    <img
                        src={midia.banner_url || midia.poster_url || 'https://via.placeholder.com/1200x400?text=Media'}
                        alt={midia.titulo_portugues || midia.titulo_original}
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
                        <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur px-3 py-1 rounded-full text-white text-sm mb-3">
                            <IconeTipo size={16} />
                            {tipoLabel[midia.tipo] || 'Mídia'}
                        </div>
                        <h1 className="text-3xl font-bold text-white mb-2">
                            {midia.titulo_portugues || midia.titulo_original}
                        </h1>
                        {midia.titulo_original && midia.titulo_portugues !== midia.titulo_original && (
                            <p className="text-lg text-gray-200">{midia.titulo_original}</p>
                        )}
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-purple-50 rounded-lg p-4 text-center">
                            <Star className="mx-auto mb-2 text-yellow-500" size={24} fill="currentColor" />
                            <p className="text-2xl font-bold text-purple-600">
                                {midia.nota_media ? Number(midia.nota_media).toFixed(1) : 'N/A'}
                            </p>
                            <p className="text-xs text-gray-600">Nota Média</p>
                        </div>

                        <div className="bg-blue-50 rounded-lg p-4 text-center">
                            <IconeTipo className="mx-auto mb-2 text-blue-500" size={24} />
                            <p className="text-lg font-bold text-blue-600 capitalize">
                                {tipoLabel[midia.tipo] || 'Mídia'}
                            </p>
                            <p className="text-xs text-gray-600">Tipo</p>
                        </div>

                        <div className="bg-green-50 rounded-lg p-4 text-center">
                            <TrendingUp className="mx-auto mb-2 text-green-500" size={24} />
                            <p className="text-lg font-bold text-green-600 capitalize">
                                {midia.status_catalogo || 'N/A'}
                            </p>
                            <p className="text-xs text-gray-600">Status</p>
                        </div>

                        <div className="bg-orange-50 rounded-lg p-4 text-center">
                            <MessageSquare className="mx-auto mb-2 text-orange-500" size={24} />
                            <p className="text-2xl font-bold text-orange-600">{avaliacoes.length}</p>
                            <p className="text-xs text-gray-600">Avaliações</p>
                        </div>
                    </div>

                    {midia.data_lancamento && (
                        <div className="flex items-center gap-2 text-gray-600">
                            <Calendar size={20} />
                            <span>Lançamento: {new Date(midia.data_lancamento).toLocaleDateString('pt-BR')}</span>
                        </div>
                    )}

                    <div>
                        <h3 className="text-xl font-bold mb-2 text-gray-800">Sinopse</h3>
                        <p className="text-gray-700 leading-relaxed">{midia.sinopse || 'Sem sinopse disponível.'}</p>
                    </div>

                    <div>
                        <h3 className="text-xl font-bold mb-4 text-gray-800">Detalhes</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            {detalhes.map(([label, value]) => (
                                <div key={label} className="bg-gray-50 rounded-lg p-4">
                                    <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">{label}</p>
                                    <p className="text-gray-800 font-medium capitalize">{value}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {isInList && onAvaliar && (
                        <button
                            onClick={() => {
                                onClose();
                                onAvaliar(midia);
                            }}
                            className="w-full py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
                        >
                            <MessageSquare size={20} />
                            Avaliar esta mídia
                        </button>
                    )}

                    {(permissions?.pode_moderar || permissions?.nivel_acesso === 'admin') && onCriarAtualizacao && (
                        <button
                            onClick={() => onCriarAtualizacao(midia)}
                            className="w-full py-3 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg font-semibold hover:from-orange-600 hover:to-red-600 transition-all"
                        >
                            Criar Atualização / Notificar Usuários
                        </button>
                    )}

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
                                                    <p className="font-semibold text-gray-800">{avaliacao.nome_completo}</p>
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
                                            <h4 className="font-semibold text-gray-800 mb-1">{avaliacao.titulo_avaliacao}</h4>
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
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AnimeDetalhesModal;
