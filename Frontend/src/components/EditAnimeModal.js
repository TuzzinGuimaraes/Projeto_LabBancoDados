import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';

const EditAnimeModal = ({ anime, isOpen, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        titulo_portugues: '',
        sinopse: '',
        numero_episodios: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (anime && isOpen) {
            setFormData({
                titulo_portugues: anime.titulo_portugues || '',
                sinopse: anime.sinopse || '',
                numero_episodios: anime.numero_episodios || ''
            });
            setError('');
        }
    }, [anime, isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await onSave(anime.id_anime, formData);
            onClose();
        } catch (err) {
            setError(err.message || 'Erro ao salvar alterações');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
                    <h2 className="text-2xl font-bold">Editar Anime</h2>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-white/20 rounded-lg transition-all"
                        disabled={loading}
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    {/* Título */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Título do Anime
                        </label>
                        <input
                            type="text"
                            value={formData.titulo_portugues}
                            onChange={(e) => handleChange('titulo_portugues', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Digite o título do anime"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Sinopse */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Sinopse / Descrição
                        </label>
                        <textarea
                            value={formData.sinopse}
                            onChange={(e) => handleChange('sinopse', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                            placeholder="Digite a sinopse do anime"
                            rows="6"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Número de Episódios */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Número Máximo de Episódios
                        </label>
                        <input
                            type="number"
                            value={formData.numero_episodios}
                            onChange={(e) => handleChange('numero_episodios', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Digite o número de episódios"
                            min="1"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Buttons */}
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

