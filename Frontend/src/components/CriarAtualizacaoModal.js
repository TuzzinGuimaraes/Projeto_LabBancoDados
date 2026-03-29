import React, { useState } from 'react';
import { AlertCircle, Bell, X } from 'lucide-react';

const labelTipo = {
    anime: 'anime',
    manga: 'mangá',
    jogo: 'jogo',
    musica: 'música'
};

const CriarAtualizacaoModal = ({ isOpen, onClose, anime, apiCall, onSuccess }) => {
    const midia = anime;
    const [formData, setFormData] = useState({
        tipo: 'noticia',
        titulo: '',
        descricao: ''
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const tiposAtualizacao = [
        { value: 'novo_conteudo', label: 'Novo Conteúdo' },
        { value: 'mudanca_status', label: 'Mudança de Status' },
        { value: 'lancamento', label: 'Lançamento' },
        { value: 'noticia', label: 'Notícia Geral' },
        { value: 'outro', label: 'Outro' }
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
            const result = await apiCall(`/midias/${midia.id_midia}/atualizacoes`, {
                method: 'POST',
                body: JSON.stringify(formData)
            });

            alert(`Atualização criada com sucesso! ${result.notificacoes_enviadas} notificação(ões) enviada(s).`);
            setFormData({ tipo: 'noticia', titulo: '', descricao: '' });
            if (onSuccess) onSuccess();
            onClose();
        } catch (err) {
            setError(err.message || 'Erro ao criar atualização');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen || !midia) return null;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="bg-gradient-to-r from-purple-600 to-blue-600 text-white p-6 rounded-t-xl">
                    <div className="flex items-start justify-between">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <Bell size={24} />
                                <h2 className="text-2xl font-bold">Criar Atualização</h2>
                            </div>
                            <p className="text-purple-100">
                                {midia.titulo_portugues || midia.titulo_original}
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

                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <div className="flex items-start gap-3">
                            <Bell className="text-blue-600 flex-shrink-0 mt-0.5" size={20} />
                            <div>
                                <p className="font-semibold text-blue-800 mb-1">Notificações Automáticas</p>
                                <p className="text-sm text-blue-700">
                                    A atualização será enviada para usuários que acompanham este {labelTipo[midia.tipo] || 'item'}
                                    ou o marcaram como favorito.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Tipo de Atualização</label>
                        <select
                            name="tipo"
                            value={formData.tipo}
                            onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                            disabled={loading}
                        >
                            {tiposAtualizacao.map(tipo => (
                                <option key={tipo.value} value={tipo.value}>{tipo.label}</option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Título da Atualização</label>
                        <input
                            type="text"
                            value={formData.titulo}
                            onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                            placeholder="Ex: Novo volume já disponível"
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                            maxLength={200}
                            disabled={loading}
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">Descrição</label>
                        <textarea
                            value={formData.descricao}
                            onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                            placeholder="Adicione mais detalhes sobre a atualização..."
                            rows={4}
                            className="w-full px-4 py-3 border border-gray-300 rounded-lg resize-none"
                            maxLength={500}
                            disabled={loading}
                        />
                    </div>

                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                        <p className="text-xs font-semibold text-gray-600 mb-2">PREVIEW DA NOTIFICAÇÃO</p>
                        <div className="bg-white rounded-lg p-3 border border-gray-200">
                            <p className="text-sm font-semibold text-gray-800">
                                {formData.titulo || 'Título da atualização...'}
                            </p>
                            <p className="text-xs text-gray-600 mt-1">
                                Novidade em {labelTipo[midia.tipo] || 'mídia'} da sua lista: {midia.titulo_portugues || midia.titulo_original}
                            </p>
                        </div>
                    </div>

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
