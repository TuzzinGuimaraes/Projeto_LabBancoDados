import React from 'react';
import { Bell, User, LogOut, Menu, X, Shield } from 'lucide-react';

const Header = ({
    user,
    permissions,
    activeTab,
    setActiveTab,
    notificacoes,
    onLogout,
    onMarcarNotificacoesLidas,
    showMobileMenu,
    setShowMobileMenu
}) => {
    const [showNotifications, setShowNotifications] = React.useState(false);

    const handleNotificationClick = () => {
        setShowNotifications(!showNotifications);
    };

    const handleMarkAllRead = () => {
        onMarcarNotificacoesLidas();
        setShowNotifications(false);
    };

    return (
        <header className="bg-gradient-to-r from-purple-600 to-blue-600 text-white shadow-lg sticky top-0 z-50">
            <div className="container mx-auto px-4 py-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold">AnimeList</h1>

                    <div className="hidden md:flex items-center gap-6">
                        <button
                            onClick={() => setActiveTab('home')}
                            className={`hover:text-purple-200 transition-colors ${activeTab === 'home' ? 'font-bold' : ''}`}
                        >
                            Home
                        </button>
                        <button
                            onClick={() => setActiveTab('catalogo')}
                            className={`hover:text-purple-200 transition-colors ${activeTab === 'catalogo' ? 'font-bold' : ''}`}
                        >
                            Catálogo
                        </button>
                        <button
                            onClick={() => setActiveTab('minha-lista')}
                            className={`hover:text-purple-200 transition-colors ${activeTab === 'minha-lista' ? 'font-bold' : ''}`}
                        >
                            Minha Lista
                        </button>
                        <button
                            onClick={() => setActiveTab('estatisticas')}
                            className={`hover:text-purple-200 transition-colors ${activeTab === 'estatisticas' ? 'font-bold' : ''}`}
                        >
                            Estatísticas
                        </button>
                        <button
                            onClick={() => setActiveTab('noticias')}
                            className={`hover:text-purple-200 transition-colors ${activeTab === 'noticias' ? 'font-bold' : ''}`}
                        >
                            Notícias
                        </button>

                        {(permissions?.pode_moderar || permissions?.nivel_acesso === 'admin') && (
                            <button
                                onClick={() => setActiveTab('admin')}
                                className={`hover:text-purple-200 transition-colors flex items-center gap-1 ${activeTab === 'admin' ? 'font-bold' : ''}`}
                            >
                                <Shield size={18} />
                                Admin
                            </button>
                        )}

                        {/* Dropdown de Notificações */}
                        <div className="relative">
                            <button
                                onClick={handleNotificationClick}
                                className="relative hover:text-purple-200 transition-colors"
                            >
                                <Bell size={24} />
                                {notificacoes.length > 0 && (
                                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                                        {notificacoes.length}
                                    </span>
                                )}
                            </button>

                            {/* Dropdown Menu */}
                            {showNotifications && (
                                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                                    <div className="p-4 border-b border-gray-200">
                                        <div className="flex justify-between items-center">
                                            <h3 className="text-gray-800 font-semibold">Notificações</h3>
                                            {notificacoes.length > 0 && (
                                                <button
                                                    onClick={handleMarkAllRead}
                                                    className="text-xs text-purple-600 hover:text-purple-800"
                                                >
                                                    Marcar todas como lidas
                                                </button>
                                            )}
                                        </div>
                                    </div>

                                    <div className="max-h-96 overflow-y-auto">
                                        {notificacoes.length === 0 ? (
                                            <div className="p-4 text-center text-gray-500">
                                                <p>Nenhuma notificação nova</p>
                                            </div>
                                        ) : (
                                            <div className="divide-y divide-gray-100">
                                                {notificacoes.slice(0, 5).map((notif, index) => (
                                                    <div key={index} className="p-3 hover:bg-gray-50 transition-colors">
                                                        {/* Título da atualização em negrito */}
                                                        <p className="text-sm font-semibold text-gray-800">
                                                            {notif.titulo || 'Nova notificação'}
                                                        </p>
                                                        {/* Mensagem: "Novidade em anime da sua lista: {nome}" */}
                                                        <p className="text-xs text-gray-600 mt-1">
                                                            {notif.mensagem || `Novidade em anime da sua lista: ${notif.anime_nome || 'Anime'}`}
                                                        </p>
                                                        {/* Data de criação */}
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

                                    {notificacoes.length > 5 && (
                                        <div className="p-2 border-t border-gray-200 text-center">
                                            <p className="text-xs text-gray-500">
                                                E mais {notificacoes.length - 5} notificação(ões)
                                            </p>
                                        </div>
                                    )}
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

                    <button
                        onClick={() => setShowMobileMenu(!showMobileMenu)}
                        className="md:hidden"
                    >
                        {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
                    </button>
                </div>

                {/* Mobile Menu */}
                {showMobileMenu && (
                    <div className="md:hidden mt-4 space-y-2">
                        <button onClick={() => { setActiveTab('home'); setShowMobileMenu(false); }} className="block w-full text-left py-2">Home</button>
                        <button onClick={() => { setActiveTab('catalogo'); setShowMobileMenu(false); }} className="block w-full text-left py-2">Catálogo</button>
                        <button onClick={() => { setActiveTab('minha-lista'); setShowMobileMenu(false); }} className="block w-full text-left py-2">Minha Lista</button>
                        <button onClick={() => { setActiveTab('estatisticas'); setShowMobileMenu(false); }} className="block w-full text-left py-2">Estatísticas</button>
                        <button onClick={() => { setActiveTab('noticias'); setShowMobileMenu(false); }} className="block w-full text-left py-2">Notícias</button>
                        {(permissions?.pode_moderar || permissions?.nivel_acesso === 'admin') && (
                            <button onClick={() => { setActiveTab('admin'); setShowMobileMenu(false); }} className="block w-full text-left py-2">Admin</button>
                        )}
                        <button onClick={onLogout} className="block w-full text-left py-2">Sair</button>
                    </div>
                )}
            </div>
        </header>
    );
};

export default Header;

