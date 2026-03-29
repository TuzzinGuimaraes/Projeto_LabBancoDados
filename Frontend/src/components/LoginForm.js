import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

const LoginForm = ({ onLogin, onRegistro }) => {
    const [email, setEmail] = useState('');
    const [senha, setSenha] = useState('');
    const [isRegistro, setIsRegistro] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        nome_completo: '',
        email: '',
        senha: '',
        data_nascimento: ''
    });

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (isRegistro) {
            const result = await onRegistro(formData);
            if (result.success) {
                setIsRegistro(false);
            } else {
                alert('Erro no registro: ' + result.error);
            }
        } else {
            const result = await onLogin(email, senha);
            if (!result.success) {
                alert('Erro no login: ' + result.error);
            }
        }
    };

    if (isRegistro) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
                <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                    <h2 className="text-3xl font-bold text-center mb-6 text-gray-800">Criar Conta</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <input
                            type="text"
                            placeholder="Nome Completo"
                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={formData.nome_completo}
                            onChange={(e) => setFormData({...formData, nome_completo: e.target.value})}
                            required
                        />
                        <input
                            type="email"
                            placeholder="Email"
                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            required
                        />
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                placeholder="Senha"
                                className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 pr-12"
                                value={formData.senha}
                                onChange={(e) => setFormData({...formData, senha: e.target.value})}
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                            >
                                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                            </button>
                        </div>
                        <input
                            type="date"
                            placeholder="Data de Nascimento"
                            className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                            value={formData.data_nascimento}
                            onChange={(e) => setFormData({...formData, data_nascimento: e.target.value})}
                        />
                        <button
                            type="submit"
                            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
                        >
                            Registrar
                        </button>
                        <button
                            type="button"
                            onClick={() => setIsRegistro(false)}
                            className="w-full text-purple-600 hover:text-purple-800 font-medium"
                        >
                            Já tem uma conta? Faça login
                        </button>
                    </form>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-2">
                        MediaList
                    </h1>
                    <p className="text-gray-600">Gerencie animes, mangás, jogos e músicas</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <input
                        type="email"
                        placeholder="Email"
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />
                    <input
                        type="password"
                        placeholder="Senha"
                        className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                        value={senha}
                        onChange={(e) => setSenha(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white py-3 rounded-lg font-semibold hover:from-purple-700 hover:to-blue-700 transition-all"
                    >
                        Entrar
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsRegistro(true)}
                        className="w-full text-purple-600 hover:text-purple-800 font-medium"
                    >
                        Criar nova conta
                    </button>
                </form>
            </div>
        </div>
    );
};

export default LoginForm;

