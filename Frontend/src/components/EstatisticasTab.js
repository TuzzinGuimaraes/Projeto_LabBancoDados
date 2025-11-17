import React from 'react';
import { BarChart3, TrendingUp, Star, Clock, FileText } from 'lucide-react';

const EstatisticasTab = ({ estatisticas }) => {
    if (!estatisticas) {
        return <div className="text-center py-10">Carregando estatísticas...</div>;
    }

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold mb-6 flex items-center gap-2">
                <BarChart3 className="text-purple-600" />
                Minhas Estatísticas
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">Total de Animes</h3>
                        <TrendingUp className="text-purple-600" size={32} />
                    </div>
                    <p className="text-4xl font-bold text-purple-600">{estatisticas.total_animes || 0}</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">Completos</h3>
                        <Star className="text-yellow-500" size={32} fill="currentColor" />
                    </div>
                    <p className="text-4xl font-bold text-yellow-500">{estatisticas.animes_completos || 0}</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">Assistindo</h3>
                        <Clock className="text-blue-500" size={32} />
                    </div>
                    <p className="text-4xl font-bold text-blue-500">{estatisticas.animes_assistindo || 0}</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">Episódios Assistidos</h3>
                        <FileText className="text-green-500" size={32} />
                    </div>
                    <p className="text-4xl font-bold text-green-500">{estatisticas.total_episodios_assistidos || 0}</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">Nota Média</h3>
                        <Star className="text-yellow-500" size={32} />
                    </div>
                    <p className="text-4xl font-bold text-yellow-500">{estatisticas.nota_media ? Number(estatisticas.nota_media).toFixed(1) : 'N/A'}</p>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-700">Favoritos</h3>
                        <Star className="text-red-500" size={32} fill="currentColor" />
                    </div>
                    <p className="text-4xl font-bold text-red-500">{estatisticas.total_favoritos || 0}</p>
                </div>
            </div>
        </div>
    );
};

export default EstatisticasTab;

