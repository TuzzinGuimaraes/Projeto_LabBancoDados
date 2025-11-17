import React from 'react';
import { FileText, Plus } from 'lucide-react';

const NoticiasTab = ({ noticias, permissions, onCreateNoticia }) => {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold flex items-center gap-2">
                    <FileText className="text-purple-600" />
                    Notícias do Mundo Anime
                </h2>

                {(permissions?.pode_moderar || permissions?.nivel_acesso === 'admin') && (
                    <button
                        onClick={onCreateNoticia}
                        className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all shadow-lg"
                    >
                        <Plus size={20} />
                        Criar Notícia
                    </button>
                )}
            </div>

            {noticias.length === 0 ? (
                <div className="text-center py-10">
                    <p className="text-gray-500">Nenhuma notícia disponível no momento.</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {noticias.map((noticia, index) => (
                        <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                            {noticia.imagem_url && (
                                <img
                                    src={noticia.imagem_url}
                                    alt={noticia.titulo}
                                    className="w-full h-48 object-cover rounded-lg mb-4"
                                />
                            )}
                            <h3 className="text-2xl font-bold mb-2">{noticia.titulo}</h3>
                            <p className="text-sm text-gray-500 mb-3">
                                Por {noticia.autor} | {new Date(noticia.data_publicacao).toLocaleDateString()}
                            </p>
                            <p className="text-gray-700">{noticia.conteudo}</p>
                            {noticia.tags && noticia.tags.length > 0 && (
                                <div className="flex gap-2 mt-4">
                                    {noticia.tags.map((tag, i) => (
                                        <span key={i} className="bg-purple-100 text-purple-700 px-3 py-1 rounded-full text-sm">
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default NoticiasTab;

