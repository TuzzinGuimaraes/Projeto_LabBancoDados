import React, { useState } from 'react';
import { X, Save, Plus } from 'lucide-react';

const CreateNoticiaModal = ({ isOpen, onClose, onSave, userName }) => {
    const [formData, setFormData] = useState({
        titulo: '',
        conteudo: '',
        categoria: 'geral',
        tags: '',
        imagem_url: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

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
            // Converter tags de string para array
            const tagsArray = formData.tags
                .split(',')
                .map(tag => tag.trim())
                .filter(tag => tag.length > 0);

            const dataToSend = {
                ...formData,
                autor: userName || 'Admin', // Usar nome do usuário logado
                tags: tagsArray
            };

            await onSave(dataToSend);

            // Limpar formulário após sucesso
            setFormData({
                titulo: '',
                conteudo: '',
                categoria: 'geral',
                tags: '',
                imagem_url: ''
            });

            onClose();
        } catch (err) {
            setError(err.message || 'Erro ao criar notícia');
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        if (!loading) {
            setFormData({
                titulo: '',
                conteudo: '',
                categoria: 'geral',
                tags: '',
                imagem_url: ''
            });
            setError('');
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 flex items-center justify-between rounded-t-2xl">
                    <div className="flex items-center gap-2">
                        <Plus size={24} />
                        <h2 className="text-2xl font-bold">Criar Nova Notícia</h2>
                    </div>
                    <button
                        onClick={handleClose}
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
                            Título da Notícia *
                        </label>
                        <input
                            type="text"
                            value={formData.titulo}
                            onChange={(e) => handleChange('titulo', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="Digite o título da notícia"
                            required
                            disabled={loading}
                        />
                    </div>

                    {/* Conteúdo */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Conteúdo
                        </label>
                        <textarea
                            value={formData.conteudo}
                            onChange={(e) => handleChange('conteudo', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none"
                            placeholder="Digite o conteúdo da notícia"
                            rows="8"
                            disabled={loading}
                        />
                    </div>

                    {/* Autor (apenas informativo) */}
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-gray-700">Autor:</span>
                            <span className="text-sm text-purple-700 font-medium">{userName || 'Admin'}</span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                            A notícia será publicada em seu nome
                        </p>
                    </div>

                    {/* Categoria */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Categoria
                        </label>
                        <select
                            value={formData.categoria}
                            onChange={(e) => handleChange('categoria', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            disabled={loading}
                        >
                            <option value="geral">Geral</option>
                            <option value="lancamento">Lançamento</option>
                            <option value="temporada">Nova Temporada</option>
                            <option value="evento">Evento</option>
                            <option value="manga">Mangá</option>
                            <option value="filme">Filme</option>
                            <option value="anuncio">Anúncio</option>
                        </select>
                    </div>

                    {/* URL da Imagem */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            URL da Imagem
                        </label>
                        <input
                            type="url"
                            value={formData.imagem_url}
                            onChange={(e) => handleChange('imagem_url', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="https://exemplo.com/imagem.jpg"
                            disabled={loading}
                        />
                        {formData.imagem_url && (
                            <div className="mt-2">
                                <img
                                    src={formData.imagem_url}
                                    alt="Preview"
                                    className="w-full h-48 object-cover rounded-lg"
                                    onError={(e) => {
                                        e.target.style.display = 'none';
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Tags (separadas por vírgula)
                        </label>
                        <input
                            type="text"
                            value={formData.tags}
                            onChange={(e) => handleChange('tags', e.target.value)}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            placeholder="anime, shonen, ação, aventura"
                            disabled={loading}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            Ex: anime, shonen, ação, aventura
                        </p>
                    </div>

                    {/* Buttons */}
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
                                    Criando...
                                </>
                            ) : (
                                <>
                                    <Save size={20} />
                                    Publicar Notícia
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateNoticiaModal;

