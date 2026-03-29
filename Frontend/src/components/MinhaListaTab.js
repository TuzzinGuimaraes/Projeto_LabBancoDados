import React, { useMemo, useState } from 'react';
import { MessageSquarePlus, Star, Trash2 } from 'lucide-react';

const STATUS_POR_TIPO = {
    anime: ['assistindo', 'completo', 'planejado', 'pausado', 'abandonado'],
    manga: ['lendo', 'lido', 'planejado', 'pausado', 'abandonado'],
    jogo: ['jogando', 'zerado', 'platinado', 'na_fila', 'abandonado'],
    musica: ['ouvindo', 'ouvido', 'planejado']
};

const LABEL_TIPO = {
    anime: 'Animes',
    manga: 'Mangás',
    jogo: 'Jogos',
    musica: 'Músicas'
};

const labelProgresso = (tipo) => {
    switch (tipo) {
        case 'anime':
            return 'Episódios';
        case 'manga':
            return 'Capítulos';
        case 'jogo':
            return 'Horas';
        case 'musica':
            return 'Faixas';
        default:
            return 'Progresso';
    }
};

const MinhaListaTab = ({ minhaLista, activeMediaType, onChangeMediaType, onUpdate, onRemove, onAvaliar, onViewDetails }) => {
    const [filtroStatus, setFiltroStatus] = useState('todos');
    const statusOptions = STATUS_POR_TIPO[activeMediaType] || [];

    const listaDoTipo = useMemo(
        () => minhaLista.filter(item => item.tipo === activeMediaType),
        [minhaLista, activeMediaType]
    );

    const listaFiltrada = filtroStatus === 'todos'
        ? listaDoTipo
        : listaDoTipo.filter(item => item.status_consumo === filtroStatus);

    return (
        <div className="space-y-6">
            <div className="flex gap-2 flex-wrap">
                {Object.entries(LABEL_TIPO).map(([tipo, label]) => (
                    <button
                        key={tipo}
                        onClick={() => {
                            onChangeMediaType(tipo);
                            setFiltroStatus('todos');
                        }}
                        className={`px-4 py-2 rounded-lg font-medium transition-all ${
                            activeMediaType === tipo
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                    >
                        {label} ({minhaLista.filter(item => item.tipo === tipo).length})
                    </button>
                ))}
            </div>

            <div className="flex gap-2 flex-wrap">
                <button
                    onClick={() => setFiltroStatus('todos')}
                    className={`px-4 py-2 rounded-lg font-medium transition-all ${
                        filtroStatus === 'todos'
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                    Todos ({listaDoTipo.length})
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
                        {status} ({listaDoTipo.filter(item => item.status_consumo === status).length})
                    </button>
                ))}
            </div>

            {listaFiltrada.length === 0 ? (
                <div className="text-center py-20">
                    <p className="text-gray-500 text-lg">Nenhuma mídia nesta categoria ainda</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {listaFiltrada.map(item => (
                        <div key={item.id_lista} className="bg-white rounded-xl shadow-md p-4 flex gap-4">
                            <img
                                src={item.poster_url || 'https://via.placeholder.com/100x150'}
                                alt={item.titulo_portugues || item.titulo_original}
                                className="w-24 h-36 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() => onViewDetails && onViewDetails(item)}
                            />

                            <div className="flex-1">
                                <h3
                                    className="font-bold text-lg mb-2 cursor-pointer hover:text-purple-600 transition-colors"
                                    onClick={() => onViewDetails && onViewDetails(item)}
                                >
                                    {item.titulo_portugues || item.titulo_original}
                                </h3>

                                <div className="space-y-2">
                                    <div className="flex items-center gap-2">
                                        <label className="text-sm text-gray-600 w-24">Status:</label>
                                        <select
                                            value={item.status_consumo}
                                            onChange={(e) => onUpdate(item.id_lista, { status_consumo: e.target.value })}
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
                                        <label className="text-sm text-gray-600 w-24">{labelProgresso(item.tipo)}:</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max={item.progresso_total || item.progresso_total_padrao || undefined}
                                            value={item.progresso_atual || 0}
                                            onChange={(e) => onUpdate(item.id_lista, { progresso_atual: Number(e.target.value) })}
                                            className="px-3 py-1 border rounded-lg text-sm w-24"
                                        />
                                        <span className="text-sm text-gray-500">
                                            / {item.progresso_total || item.progresso_total_padrao || '?'}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <label className="text-sm text-gray-600 w-24">Nota:</label>
                                        <input
                                            type="number"
                                            min="0"
                                            max="10"
                                            step="0.5"
                                            value={item.nota_usuario || ''}
                                            onChange={(e) => onUpdate(item.id_lista, { nota_usuario: e.target.value === '' ? null : Number(e.target.value) })}
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
                                            checked={Boolean(item.favorito)}
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
                                    title="Avaliar mídia"
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
