import React from 'react';
import { Star, Plus, Edit, Trash2 } from 'lucide-react';

const AnimeCard = ({ anime, showAddButton = true, showActions = false, onAdd, onEdit, onDelete, onViewDetails, isInList, permissions }) => {
    return (
        <div className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-1">
            <div
                className="relative h-72 cursor-pointer"
                onClick={() => onViewDetails && onViewDetails(anime)}
            >
                <img
                    src={anime.poster_url || 'https://via.placeholder.com/300x450?text=No+Image'}
                    alt={anime.titulo_portugues}
                    className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-yellow-500 text-white px-3 py-1 rounded-full font-bold flex items-center gap-1">
                    <Star size={16} fill="white" />
                    {anime?.nota_media ? Number(anime.nota_media).toFixed(1) : 'N/A'}
                </div>
            </div>

            <div className="p-4">
                <h3 
                    className="font-bold text-lg mb-2 line-clamp-2 h-14 cursor-pointer hover:text-purple-600 transition-colors"
                    onClick={() => onViewDetails && onViewDetails(anime)}
                >
                    {anime.titulo_portugues || anime.titulo_original}
                </h3>
                <p className="text-sm text-gray-600 mb-3 line-clamp-2">{anime.sinopse || 'Sem sinopse disponível'}</p>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                    <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">{anime.status_anime}</span>
                    <span>{anime.numero_episodios || '?'} eps</span>
                </div>

                {showAddButton && (
                    <button
                        onClick={() => onAdd(anime.id_anime)}
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
                            onClick={() => onEdit(anime)}
                            className="flex-1 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 flex items-center justify-center gap-1 transition-colors"
                        >
                            <Edit size={16} /> Editar
                        </button>
                        {permissions?.pode_deletar ? (
                            <button
                                onClick={() => onDelete(anime.id_anime)}
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

