import React from 'react';
import { BarChart3, Heart, Star, TrendingUp } from 'lucide-react';

const LABEL_TIPO = {
    anime: 'Animes',
    manga: 'Mangás',
    jogo: 'Jogos',
    musica: 'Músicas'
};

const EstatisticasTab = ({ estatisticas, resumo }) => {
    if (!estatisticas) {
        return <div className="text-center py-10">Carregando estatísticas...</div>;
    }

    const cards = Array.isArray(estatisticas) ? estatisticas : [];

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <BarChart3 className="text-purple-600" />
                Minhas Estatísticas
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-lg p-5">
                    <p className="text-sm text-gray-600 mb-1">Total de mídias</p>
                    <p className="text-3xl font-bold text-purple-600">{resumo?.total_midias || 0}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-5">
                    <p className="text-sm text-gray-600 mb-1">Concluídas</p>
                    <p className="text-3xl font-bold text-green-600">{resumo?.concluidos || 0}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-5">
                    <p className="text-sm text-gray-600 mb-1">Em andamento</p>
                    <p className="text-3xl font-bold text-blue-600">{resumo?.em_andamento || 0}</p>
                </div>
                <div className="bg-white rounded-xl shadow-lg p-5">
                    <p className="text-sm text-gray-600 mb-1">Favoritos</p>
                    <p className="text-3xl font-bold text-red-500">{resumo?.favoritos || 0}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
                {cards.map(item => (
                    <div key={item.tipo} className="bg-white rounded-xl shadow-lg p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-700">{LABEL_TIPO[item.tipo] || item.label}</h3>
                            <TrendingUp className="text-purple-600" size={24} />
                        </div>

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Total</span>
                                <span className="font-bold text-xl text-purple-600">{item.total_midias || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Concluídos</span>
                                <span className="font-semibold text-green-600">{item.concluidos || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600">Em andamento</span>
                                <span className="font-semibold text-blue-600">{item.em_andamento || 0}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 flex items-center gap-1">
                                    <Star size={14} className="text-yellow-500" />
                                    Nota média
                                </span>
                                <span className="font-semibold text-yellow-600">
                                    {item.nota_media ? Number(item.nota_media).toFixed(1) : 'N/A'}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-sm text-gray-600 flex items-center gap-1">
                                    <Heart size={14} className="text-red-500" />
                                    Favoritos
                                </span>
                                <span className="font-semibold text-red-500">{item.favoritos || 0}</span>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EstatisticasTab;
