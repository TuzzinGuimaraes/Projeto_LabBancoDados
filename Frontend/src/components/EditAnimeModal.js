import React, { useEffect, useState } from 'react';
import { Save, X } from 'lucide-react';

const tipoLabel = {
    anime: 'Anime',
    manga: 'Mangá',
    jogo: 'Jogo',
    musica: 'Música'
};

const EditAnimeModal = ({ anime, isOpen, onClose, onSave }) => {
    const midia = anime;
    const [formData, setFormData] = useState({});
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (midia && isOpen) {
            setFormData({
                titulo_portugues: midia.titulo_portugues || '',
                sinopse: midia.sinopse || '',
                poster_url: midia.poster_url || '',
                status_anime: midia.status_anime || '',
                numero_episodios: midia.numero_episodios || '',
                status_manga: midia.status_manga || '',
                numero_capitulos: midia.numero_capitulos || '',
                numero_volumes: midia.numero_volumes || '',
                autor: midia.autor || '',
                status_jogo: midia.status_jogo || '',
                plataformas: midia.plataformas || '',
                desenvolvedor: midia.desenvolvedor || '',
                tipo_lancamento: midia.tipo_lancamento || '',
                numero_faixas: midia.numero_faixas || '',
                artista: midia.musica_artista || ''
            });
            setError('');
        }
    }, [midia, isOpen]);

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const payload = {
                titulo_portugues: formData.titulo_portugues,
                sinopse: formData.sinopse,
                poster_url: formData.poster_url
            };

            if (midia.tipo === 'anime') {
                payload.status_anime = formData.status_anime;
                payload.numero_episodios = Number(formData.numero_episodios || 0) || null;
            } else if (midia.tipo === 'manga') {
                payload.status_manga = formData.status_manga;
                payload.numero_capitulos = Number(formData.numero_capitulos || 0) || null;
                payload.numero_volumes = Number(formData.numero_volumes || 0) || null;
                payload.autor = formData.autor;
            } else if (midia.tipo === 'jogo') {
                payload.status_jogo = formData.status_jogo;
                payload.plataformas = formData.plataformas;
                payload.desenvolvedor = formData.desenvolvedor;
            } else if (midia.tipo === 'musica') {
                payload.tipo_lancamento = formData.tipo_lancamento;
                payload.numero_faixas = Number(formData.numero_faixas || 0) || null;
                payload.artista = formData.artista;
            }

            await onSave(midia.id_midia, payload);
            onClose();
        } catch (err) {
            setError(err.message || 'Erro ao salvar alterações');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !midia) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
                    <h2 className="text-2xl font-bold">Editar {tipoLabel[midia.tipo] || 'Mídia'}</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition-all"
                        disabled={loading}
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Título</label>
                        <input
                            type="text"
                            value={formData.titulo_portugues}
                            onChange={(e) => handleChange('titulo_portugues', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Sinopse / Descrição</label>
                        <textarea
                            value={formData.sinopse}
                            onChange={(e) => handleChange('sinopse', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none"
                            rows="5"
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">URL do poster</label>
                        <input
                            type="text"
                            value={formData.poster_url}
                            onChange={(e) => handleChange('poster_url', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                            disabled={loading}
                        />
                    </div>

                    {midia.tipo === 'anime' && (
                        <>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                                <select
                                    value={formData.status_anime}
                                    onChange={(e) => handleChange('status_anime', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                >
                                    <option value="em_exibicao">Em exibição</option>
                                    <option value="finalizado">Finalizado</option>
                                    <option value="aguardando">Aguardando</option>
                                    <option value="cancelado">Cancelado</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Número de episódios</label>
                                <input
                                    type="number"
                                    value={formData.numero_episodios}
                                    onChange={(e) => handleChange('numero_episodios', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </>
                    )}

                    {midia.tipo === 'manga' && (
                        <>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                                <select
                                    value={formData.status_manga}
                                    onChange={(e) => handleChange('status_manga', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                >
                                    <option value="em_publicacao">Em publicação</option>
                                    <option value="finalizado">Finalizado</option>
                                    <option value="aguardando">Aguardando</option>
                                    <option value="cancelado">Cancelado</option>
                                    <option value="hiato">Hiato</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Capítulos</label>
                                    <input
                                        type="number"
                                        value={formData.numero_capitulos}
                                        onChange={(e) => handleChange('numero_capitulos', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">Volumes</label>
                                    <input
                                        type="number"
                                        value={formData.numero_volumes}
                                        onChange={(e) => handleChange('numero_volumes', e.target.value)}
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Autor</label>
                                <input
                                    type="text"
                                    value={formData.autor}
                                    onChange={(e) => handleChange('autor', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </>
                    )}

                    {midia.tipo === 'jogo' && (
                        <>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Status</label>
                                <select
                                    value={formData.status_jogo}
                                    onChange={(e) => handleChange('status_jogo', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                >
                                    <option value="lancado">Lançado</option>
                                    <option value="em_desenvolvimento">Em desenvolvimento</option>
                                    <option value="cancelado">Cancelado</option>
                                    <option value="remasterizado">Remasterizado</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Plataformas</label>
                                <input
                                    type="text"
                                    value={formData.plataformas}
                                    onChange={(e) => handleChange('plataformas', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Desenvolvedor</label>
                                <input
                                    type="text"
                                    value={formData.desenvolvedor}
                                    onChange={(e) => handleChange('desenvolvedor', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </>
                    )}

                    {midia.tipo === 'musica' && (
                        <>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de lançamento</label>
                                <select
                                    value={formData.tipo_lancamento}
                                    onChange={(e) => handleChange('tipo_lancamento', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                >
                                    <option value="album">Álbum</option>
                                    <option value="ep">EP</option>
                                    <option value="single">Single</option>
                                    <option value="compilacao">Compilação</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Número de faixas</label>
                                <input
                                    type="number"
                                    value={formData.numero_faixas}
                                    onChange={(e) => handleChange('numero_faixas', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">Artista</label>
                                <input
                                    type="text"
                                    value={formData.artista}
                                    onChange={(e) => handleChange('artista', e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </>
                    )}

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-semibold hover:bg-gray-50 transition-all"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all flex items-center justify-center gap-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    Salvando...
                                </>
                            ) : (
                                <>
                                    <Save size={20} />
                                    Salvar Alterações
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditAnimeModal;
