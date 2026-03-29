import React from 'react';
import { Bell, Gamepad2, Library, LogOut, Menu, Music4, Shield, Tv2, User, X } from 'lucide-react';

const MEDIA_OPTIONS = [
    { id: 'anime', label: 'Animes', icon: Tv2 },
    { id: 'manga', label: 'Mangás', icon: Library },
    { id: 'jogo', label: 'Jogos', icon: Gamepad2 },
    { id: 'musica', label: 'Músicas', icon: Music4 }
];

const Header = ({
    user,
    permissions,
    activeTab,
    setActiveTab,
    activeMediaType,
    setActiveMediaType,
    notificacoes,
    onLogout,
    onMarcarNotificacoesLidas,
    showMobileMenu,
    setShowMobileMenu
}) => {
    const [showNotifications, setShowNotifications] = React.useState(false);

    const irParaTipo = (tipo) => {
        setActiveMediaType(tipo);
        setActiveTab('catalogo');
        setShowMobileMenu(false);
    };

    const linksPrincipais = [
        { id: 'home', label: 'Home' },
        { id: 'catalogo', label: 'Catálogo' },
        { id: 'minha-lista', label: 'Minha Lista' },
        { id: 'estatisticas', label: 'Estatísticas' },
        { id: 'noticias', label: 'Notícias' }
    ];

    return (
        <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold">MediaList</h1>
                        <p className="text-xs text-purple-100">Animes, mangás, jogos e músicas</p>
                    </div>

                    <div className="hidden lg:flex items-center gap-2 bg-white/10 rounded-full p-1">
                        {MEDIA_OPTIONS.map(({ id, label, icon: Icon }) => (
                            <button
                                key={id}
                                onClick={() => irParaTipo(id)}
                                className={`px-3 py-2 rounded-full text-sm flex items-center gap-2 transition-all ${
                                    activeMediaType === id && activeTab === 'catalogo'
                                        ? 'bg-white text-purple-700'
                                        : 'hover:bg-white/15'
                                }`}
                            >
                                <Icon size={16} />
                                {label}
                            </button>
                        ))}
                    </div>

                    <div className="hidden md:flex items-center gap-5">
                        {linksPrincipais.map(link => (
                            <button
                                key={link.id}
                                onClick={() => setActiveTab(link.id)}
                                className={`hover:text-purple-200 transition-colors ${activeTab === link.id ? 'font-bold' : ''}`}
                            >
                                {link.label}
                            </button>
                        ))}

                        {(permissions?.pode_moderar || permissions?.nivel_acesso === 'admin') && (
                            <button
                                onClick={() => setActiveTab('admin')}
                                className={`hover:text-purple-200 transition-colors flex items-center gap-1 ${activeTab === 'admin' ? 'font-bold' : ''}`}
                            >
                                <Shield size={18} />
                                Admin
                            </button>
                        )}

                        <div className="relative">
                            <button
                                onClick={() => setShowNotifications(!showNotifications)}
                                className="relative hover:text-purple-200 transition-colors"
                            >
                                <Bell size={24} />
                                {notificacoes.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                                        {notificacoes.length}
                                    </span>
                                )}
                            </button>

                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50 text-gray-800">
                                    <div className="p-4 border-b border-gray-200 flex justify-between items-center">
                                        <h3 className="font-semibold">Notificações</h3>
                                        {notificacoes.length > 0 && (
                                            <button
                                                onClick={() => {
                                                    onMarcarNotificacoesLidas();
                                                    setShowNotifications(false);
                                                }}
                                                className="text-xs text-purple-600 hover:text-purple-800"
                                            >
                                                Marcar todas como lidas
                                            </button>
                                        )}
                                    </div>

                                    <div className="max-h-96 overflow-y-auto">
                                        {notificacoes.length === 0 ? (
                                            <div className="p-4 text-center text-gray-500">
                                                Nenhuma notificação nova
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-gray-100">
                                                {notificacoes.slice(0, 5).map((notif, index) => (
                                                    <div key={index} className="p-3 hover:bg-gray-50 transition-colors">
                                                        <p className="text-sm font-semibold text-gray-800">
                                                            {notif.titulo || 'Nova notificação'}
                                                        </p>
                                                        <p className="text-xs text-gray-600 mt-1">
                                                            {notif.mensagem || `Novidade em mídia da sua lista: ${notif.midia_nome || notif.anime_nome || 'Mídia'}`}
                                                        </p>
                                                        {(notif.data_criacao || notif.data) && (
                                                            <p className="text-xs text-gray-400 mt-1">
                                                                {new Date(notif.data_criacao || notif.data).toLocaleDateString('pt-BR')}
                                                            </p>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="flex items-center gap-2">
                            <User size={20} />
                            <div>
                                <div className="font-medium">{user.nome}</div>
                                <div className="text-xs text-purple-200">{permissions?.nivel_acesso}</div>
                            </div>
                        </div>

                        <button
                            onClick={onLogout}
                            className="flex items-center gap-2 bg-white/20 px-4 py-2 rounded-lg hover:bg-white/30 transition-all"
                        >
                            <LogOut size={20} />
                            Sair
                        </button>
                    </div>

                    <button onClick={() => setShowMobileMenu(!showMobileMenu)} className="md:hidden">
                        {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                <div className="mt-4 flex lg:hidden gap-2 overflow-x-auto pb-2">
                    {MEDIA_OPTIONS.map(({ id, label, icon: Icon }) => (
                        <button
                            key={id}
                            onClick={() => irParaTipo(id)}
                            className={`px-3 py-2 rounded-full text-sm whitespace-nowrap flex items-center gap-2 ${
                                activeMediaType === id && activeTab === 'catalogo'
                                    ? 'bg-white text-purple-700'
                                    : 'bg-white/10'
                            }`}
                        >
                            <Icon size={16} />
                            {label}
                        </button>
                    ))}
                </div>

                {showMobileMenu && (
                    <div className="md:hidden mt-4 space-y-2">
                        {linksPrincipais.map(link => (
                            <button
                                key={link.id}
                                onClick={() => {
                                    setActiveTab(link.id);
                                    setShowMobileMenu(false);
                                }}
                                className="block w-full text-left py-2"
                            >
                                {link.label}
                            </button>
                        ))}
                        {(permissions?.pode_moderar || permissions?.nivel_acesso === 'admin') && (
                            <button
                                onClick={() => {
                                    setActiveTab('admin');
                                    setShowMobileMenu(false);
                                }}
                                className="block w-full text-left py-2"
                            >
                                Admin
                            </button>
                        )}
                        <button onClick={onLogout} className="block w-full text-left py-2">Sair</button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;
