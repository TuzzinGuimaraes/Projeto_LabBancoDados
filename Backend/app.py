"""
AnimeList API - Versão Completamente Refatorada
Todos os endpoints migrados para blueprints
"""
from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager

# Imports dos módulos refatorados
from config import JWT_SECRET_KEY, JWT_ACCESS_TOKEN_EXPIRES, token_blocklist
from database import init_mongodb, get_db_connection

# Importar todos os blueprints
from routes import (
    auth_bp,
    usuario_bp,
    animes_bp,
    lista_bp,
    avaliacoes_bp,
    noticias_bp,
    moderacao_bp,
    preferencias_bp,
    utils_bp
)

# Criar app
app = Flask(__name__)
CORS(app)

# Configurações JWT
app.config['JWT_SECRET_KEY'] = JWT_SECRET_KEY
app.config['JWT_ACCESS_TOKEN_EXPIRES'] = JWT_ACCESS_TOKEN_EXPIRES

jwt = JWTManager(app)

# Inicializar MongoDB
init_mongodb()

# Verificar conexão MySQL
try:
    mysql_conn = get_db_connection()
    if mysql_conn:
        mysql_conn.close()
        print("✅ MySQL conectado com sucesso!")
    else:
        print("⚠️  Aviso: MySQL não conectado")
        print("   Verifique se o servidor MySQL está rodando na porta 3308")
except Exception as e:
    print(f"⚠️  Aviso: Erro ao conectar MySQL - {e}")
    print("   Verifique as configurações em config.py")

# ============================================
# REGISTRAR TODOS OS BLUEPRINTS
# ============================================

# Autenticação e Usuário
app.register_blueprint(auth_bp, url_prefix='/api/auth')
app.register_blueprint(usuario_bp, url_prefix='/api/usuario')

# Animes e relacionados
app.register_blueprint(animes_bp, url_prefix='/api/animes')
app.register_blueprint(lista_bp, url_prefix='/api/lista')
app.register_blueprint(avaliacoes_bp, url_prefix='/api/avaliacoes')

# Conteúdo
app.register_blueprint(noticias_bp, url_prefix='/api/noticias')

# Administração
app.register_blueprint(moderacao_bp, url_prefix='/api/moderacao')
app.register_blueprint(preferencias_bp, url_prefix='/api/preferencias')

# Utilidades (generos, notificações, health, etc)
app.register_blueprint(utils_bp, url_prefix='/api')

# ============================================
# JWT CALLBACKS
# ============================================

@jwt.token_in_blocklist_loader
def check_if_token_revoked(jwt_header, jwt_payload):
    """Verificar se token foi revogado"""
    return jwt_payload['jti'] in token_blocklist

# ============================================
# ERROR HANDLERS
# ============================================

@app.errorhandler(404)
def not_found(e):
    return jsonify({'erro': 'Endpoint não encontrado'}), 404

@app.errorhandler(500)
def internal_error(e):
    return jsonify({'erro': 'Erro interno do servidor'}), 500

@app.errorhandler(401)
def unauthorized(e):
    return jsonify({'erro': 'Não autorizado'}), 401

@app.errorhandler(403)
def forbidden(e):
    return jsonify({'erro': 'Acesso negado'}), 403

# ============================================
# INICIALIZAÇÃO
# ============================================

if __name__ == '__main__':
    print("=" * 70)
    print("🚀 AnimeList API")
    print("=" * 70)
    print()
    print("🎯 Recursos SQL:")
    print("   • Triggers (atualização automática de notas)")
    print("   • Views (queries complexas pré-definidas)")
    print("   • Procedures (lógica de negócio no BD)")
    print("   • Functions (cálculos e validações)")
    print()
    print("💾 Bancos de Dados:")
    print("   • MySQL - Dados relacionais")
    print("   • MongoDB - Notícias, notificações, preferências")
    print()
    print("🌐 Servidor: http://localhost:5000")
    print("=" * 70)
    print()

    app.run(debug=True, port=5000)

