import React from 'react';
import { Edit, Plus, Star, Trash2 } from 'lucide-react';

const tipoLabel = {
    anime: 'Anime',
    manga: 'Mangá',
    jogo: 'Jogo',
    musica: 'Música'
};

const metricaResumo = (midia) => {
    switch (midia.tipo) {
        case 'anime':
            return `${midia.numero_episodios || '?'} eps`;
        case 'manga':
            return `${midia.numero_capitulos || '?'} caps`;
        case 'jogo':
            return midia.plataformas || 'Plataformas não informadas';
        case 'musica':
            return `${midia.numero_faixas || '?'} faixas`;
        default:
            return '';
    }
};

const AnimeCard = ({
    anime,
    showAddButton = true,
    showActions = false,
    onAdd,
    onEdit,
    onDelete,
    onViewDetails,
    isInList,
    permissions
}) => {
    const midia = anime;
    const status = midia.status_catalogo || midia.status_anime || midia.status_manga || midia.status_jogo || midia.tipo_lancamento;

    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1">
            <div className="relative h-72 cursor-pointer" onClick={() => onViewDetails && onViewDetails(midia)}>
                <img
                    src={midia.poster_url || 'https://via.placeholder.com/300x450?text=No+Image'}
                    alt={midia.titulo_portugues || midia.titulo_original}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full font-bold flex items-center gap-1">
                    <Star size={16} fill="white" />
                    {midia?.nota_media ? Number(midia.nota_media).toFixed(1) : 'N/A'}
                </div>
                <div className="absolute top-2 left-2 bg-black/60 text-white px-3 py-1 rounded-full text-xs font-semibold">
                    {tipoLabel[midia.tipo] || 'Mídia'}
                </div>
            </div>

            <div className="p-4">
                <h3
                    className="font-bold text-lg mb-2 line-clamp-2 h-14 cursor-pointer hover:text-purple-600 transition-colors"
                    onClick={() => onViewDetails && onViewDetails(midia)}
                >
                    {midia.titulo_portugues || midia.titulo_original}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {midia.sinopse || 'Sem descrição disponível'}
                </p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-3 gap-2">
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded capitalize">
                        {status || 'sem status'}
                    </span>
                    <span className="text-right">{metricaResumo(midia)}</span>
                </div>

                {showAddButton && (
                    <button
                        onClick={() => onAdd(midia.id_midia, midia.tipo)}
                        disabled={isInList}
                        className={`w-full py-2 rounded-lg font-semibold transition-all flex items-center justify-center gap-2 ${
                            isInList
                                ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                : 'bg-gradient-to-r from-purple-600 to-blue-600 text-white hover:from-purple-700 hover:to-blue-700'
                        }`}
                    >
                        {isInList ? 'Na Lista' : <><Plus size={20} /> Adicionar</>}
                    </button>
                )}

                {showActions ? (
                    <div className="flex gap-2 mt-2">
                        <button
                            onClick={() => onEdit(midia)}
                            className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-1 transition-colors"
                        >
                            <Edit size={16} /> Editar
                        </button>
                        {permissions?.pode_deletar ? (
                            <button
                                onClick={() => onDelete(midia.id_midia)}
                                className="flex-1 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 flex items-center justify-center gap-1 transition-colors"
                            >
                                <Trash2 size={16} /> Deletar
                            </button>
                        ) : null}
                    </div>
                ) : null}
            </div>
        </div>
    );
};

export default AnimeCard;
