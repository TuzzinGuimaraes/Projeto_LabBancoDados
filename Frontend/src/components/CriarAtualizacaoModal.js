import React, { useState } from 'react';
import { X, Bell, AlertCircle } from 'lucide-react';

const CriarAtualizacaoModal = ({ isOpen, onClose, anime, apiCall, onSuccess }) => {
    const [formData, setFormData] = useState({
        tipo: 'novo_episodio',
        titulo: '',
        descricao: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const tiposAtualizacao = [
        { value: 'novo_episodio', label: '📺 Novo Episódio' },
        { value: 'nova_temporada', label: '🎬 Nova Temporada' },
        { value: 'mudanca_status', label: '🔄 Mudança de Status' },
        { value: 'noticia', label: '📰 Notícia Geral' },
        { value: 'outro', label: '📌 Outro' }
    ];

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!formData.titulo.trim()) {
            setError('O título é obrigatório');
            return;
        }

        setLoading(true);
        try {
            const result = await apiCall(`/animes/${anime.id_anime}/atualizacoes`, {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            alert(`Atualização criada com sucesso! ${result.notificacoes_enviadas} notificação(ões) enviada(s).`);

            // Resetar formulário
            setFormData({
                tipo: 'novo_episodio',
                titulo: '',
                descricao: ''
            });

            if (onSuccess) onSuccess();
            onClose();
        } catch (error) {
            setError(error.message || 'Erro ao criar atualização');
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    if (!isOpen || !anime) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-xl">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Bell size={24} />
                                <h2 className="text-2xl font-bold">Criar Atualização</h2>
                            </div>
                            <p className="text-purple-100">
                                {anime.titulo_portugues || anime.titulo_original}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 hover:bg-white/20 rounded-lg transition-all"
                            disabled={loading}
                        >
                            <X size={24} />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
                            <AlertCircle className="text-red-600 flex-shrink-0 mt-0.5" size={20} />
                            <div>
                                <p className="font-semibold text-red-800">Erro</p>
                                <p className="text-sm text-red-600">{error}</p>
                            </div>
                        </div>
                    )}

                    {/* Informação sobre notificações */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <Bell className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                            <div>
                                <p className="font-semibold text-blue-800 mb-1">
                                    Notificações Automáticas
                                </p>
                                <p className="text-sm text-blue-700">
                                    Esta atualização será enviada automaticamente para todos os usuários que têm
                                    este anime na lista com status "assistindo" ou "planejado", ou marcado como favorito.
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Tipo de Atualização */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Tipo de Atualização *
                        </label>
                        <select
                            name="tipo"
                            value={formData.tipo}
                            onChange={handleChange}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                            required
                            disabled={loading}
                        >
                            {tiposAtualizacao.map(tipo => (
                                <option key={tipo.value} value={tipo.value}>
                                    {tipo.label}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Título */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Título da Atualização *
                        </label>
                        <input
                            type="text"
                            name="titulo"
                            value={formData.titulo}
                            onChange={handleChange}
                            placeholder="Ex: Episódio 24 já disponível!"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                            required
                            maxLength={200}
                            disabled={loading}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {formData.titulo.length}/200 caracteres
                        </p>
                    </div>

                    {/* Descrição */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Descrição (Opcional)
                        </label>
                        <textarea
                            name="descricao"
                            value={formData.descricao}
                            onChange={handleChange}
                            placeholder="Adicione mais detalhes sobre a atualização..."
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all resize-none"
                            maxLength={500}
                            disabled={loading}
                        />
                        <p className="text-xs text-gray-500 mt-1">
                            {formData.descricao.length}/500 caracteres
                        </p>
                    </div>

                    {/* Preview da Mensagem */}
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-600 mb-2">
                            PREVIEW DA NOTIFICAÇÃO
                        </p>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <p className="text-sm font-semibold text-gray-800">
                                {formData.titulo || 'Título da atualização...'}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                                Novidade em anime da sua lista: {anime.titulo_portugues || anime.titulo_original}
                            </p>
                        </div>
                    </div>

                    {/* Botões */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-semibold"
                            disabled={loading}
                        >
                            Cancelar
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            disabled={loading}
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    Enviando...
                                </>
                            ) : (
                                <>
                                    <Bell size={20} />
                                    Criar e Notificar Usuários
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CriarAtualizacaoModal;

