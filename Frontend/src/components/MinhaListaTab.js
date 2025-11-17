import React, { useState } from 'react';
import { Star, Trash2, MessageSquarePlus } from 'lucide-react';

const MinhaListaTab = ({ minhaLista, onUpdate, onRemove, onAvaliar, onViewDetails }) => {
    const statusOptions = ['assistindo', 'completo', 'planejado', 'pausado', 'abandonado'];
    const [filtroStatus, setFiltroStatus] = useState('todos');

    const listaFiltrada = filtroStatus === 'todos'
        ? minhaLista
        : minhaLista.filter(item => item.status_visualizacao === filtroStatus);

    return (
        <div className="space-y-6">
            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={() => setFiltroStatus('todos')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        filtroStatus === 'todos'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Todos ({minhaLista.length})
                </button>
                {statusOptions.map(status => (
                    <button
                        key={status}
                        onClick={() => setFiltroStatus(status)}
                        className={`px-4 py-2 rounded-lg font-medium transition-all capitalize ${
                            filtroStatus === status
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        {status} ({minhaLista.filter(item => item.status_visualizacao === status).length})
                    </button>
                ))}
            </div>

            {listaFiltrada.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-gray-500 text-lg">Nenhum anime nesta categoria ainda</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {listaFiltrada.map(item => (
                        <div key={item.id_lista} className="bg-white rounded-xl shadow-md p-4 flex gap-4">
                            <img
                                src={item.poster_url || 'https://via.placeholder.com/100x150'}
                                alt={item.titulo_portugues}
                                className="w-24 h-36 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => onViewDetails && onViewDetails(item)}
                            />

                            <div className="flex-1">
                                <h3 
                                    className="font-bold text-lg mb-2 cursor-pointer hover:text-purple-600 transition-colors"
                                    onClick={() => onViewDetails && onViewDetails(item)}
                                >
                                    {item.titulo_portugues}
                                </h3>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm text-gray-600 w-20">Status:</label>
                                        <select
                                            value={item.status_visualizacao}
                                            onChange={(e) => onUpdate(item.id_lista, { status_visualizacao: e.target.value })}
                                            className="px-3 py-1 border rounded-lg text-sm"
                                        >
                                            {statusOptions.map(status => (
                                                <option key={status} value={status} className="capitalize">
                                                    {status}
                                                </option>
                                            ))}
                                        </select>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <label className="text-sm text-gray-600 w-20">Episódios:</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max={item.numero_episodios}
                                            value={item.episodios_assistidos}
                                            onChange={(e) => onUpdate(item.id_lista, { episodios_assistidos: parseInt(e.target.value) })}
                                            className="px-3 py-1 border rounded-lg text-sm w-20"
                                        />
                                        <span className="text-sm text-gray-500">/ {item.numero_episodios || '?'}</span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <label className="text-sm text-gray-600 w-20">Nota:</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            step="0.5"
                                            value={item.nota_usuario || ''}
                                            onChange={(e) => onUpdate(item.id_lista, { nota_usuario: parseFloat(e.target.value) })}
                                            className="px-3 py-1 border rounded-lg text-sm w-20"
                                            placeholder="0-10"
                                        />
                                        <div className="flex text-yellow-500">
                                            {[...Array(5)].map((_, i) => (
                                                <Star key={i} size={16} fill={item.nota_usuario >= (i + 1) * 2 ? 'currentColor' : 'none'} />
                                            ))}
                                        </div>
                                    </div>

                                    <label className="flex items-center gap-2 text-sm">
                                        <input
                                            type="checkbox"
                                            checked={item.favorito}
                                            onChange={(e) => onUpdate(item.id_lista, { favorito: e.target.checked })}
                                            className="w-4 h-4"
                                        />
                                        <span className="text-gray-700">Favorito ⭐</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2 items-center justify-center">
                                <button
                                    onClick={() => onAvaliar(item)}
                                    className="bg-purple-500 text-white p-2 rounded-lg hover:bg-purple-600 transition-all"
                                    title="Avaliar anime"
                                >
                                    <MessageSquarePlus size={20} />
                                </button>
                                <button
                                    onClick={() => onRemove(item.id_lista)}
                                    className="text-red-500 hover:text-red-700 p-2"
                                    title="Remover da lista"
                                >
                                    <Trash2 size={20} />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default MinhaListaTab;

