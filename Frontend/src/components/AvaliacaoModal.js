import React, { useState } from 'react';
import { Save, Star, X } from 'lucide-react';

const tipoLabel = {
    anime: 'anime',
    manga: 'mangá',
    jogo: 'jogo',
    musica: 'música'
};

const AvaliacaoModal = ({ isOpen, onClose, onSave, anime }) => {
    const midia = anime;
    const [formData, setFormData] = useState({
        nota: 5,
        titulo_avaliacao: '',
        texto_avaliacao: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const resetForm = () => {
        setFormData({
            nota: 5,
            titulo_avaliacao: '',
            texto_avaliacao: ''
        });
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            await onSave(midia.id_midia, formData);
            resetForm();
            onClose();
        } catch (err) {
            setError(err.message || 'Erro ao criar avaliação');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            resetForm();
            onClose();
        }
    };

    if (!isOpen || !midia) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-2xl font-bold mb-1">Avaliar {tipoLabel[midia.tipo] || 'mídia'}</h2>
                            <p className="text-sm text-purple-100">{midia.titulo_portugues || midia.titulo_original}</p>
                        </div>
                        <button
                            onClick={handleClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-all"
                            disabled={loading}
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-3">
                            Sua Nota (0 - 10) *
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="0"
                                max="10"
                                step="0.5"
                                value={formData.nota}
                                onChange={(e) => handleChange('nota', parseFloat(e.target.value))}
                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                                disabled={loading}
                            />
                            <div className="flex items-center gap-2 min-w-[100px]">
                                <span className="text-3xl font-bold text-purple-600">{formData.nota}</span>
                                <Star size={24} className="text-yellow-500" fill="currentColor" />
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Título da Avaliação
                        </label>
                        <input
                            type="text"
                            value={formData.titulo_avaliacao}
                            onChange={(e) => handleChange('titulo_avaliacao', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Ex: Melhor descoberta do mês"
                            disabled={loading}
                            maxLength={100}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Sua Avaliação
                        </label>
                        <textarea
                            value={formData.texto_avaliacao}
                            onChange={(e) => handleChange('texto_avaliacao', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                            placeholder="Escreva sua opinião sobre esta mídia..."
                            rows="6"
                            disabled={loading}
                            maxLength={1000}
                        />
                        <p className="text-xs text-gray-500 mt-1 text-right">
                            {formData.texto_avaliacao.length}/1000 caracteres
                        </p>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={handleClose}
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
                                    Publicar Avaliação
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AvaliacaoModal;
