"""
Blueprint de Utilidades
Endpoints diversos: gêneros, notificações, health, etc
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import database  # Importar módulo inteiro
from database import execute_query

utils_bp = Blueprint('utils', __name__)

# ============================================
# GÊNEROS
# ============================================

@utils_bp.route('/generos', methods=['GET'])
def listar_generos():
    """Listar todos os gêneros"""
    try:
        query = "SELECT * FROM generos ORDER BY nome_genero"
        generos = execute_query(query)
        return jsonify({'generos': generos or []}), 200
    except Exception as e:
        print(f"Erro ao listar gêneros: {e}")
        return jsonify({'erro': 'Erro ao buscar gêneros'}), 500


# ============================================
# NOTIFICAÇÕES
# ============================================

@utils_bp.route('/notificacoes', methods=['GET'])
@jwt_required()
def obter_notificacoes():
    """Obter notificações do usuário"""
    if database.mongo_db is None or database.notificacoes_collection is None:
        return jsonify({'notificacoes': []}), 200

    try:
        user_id = get_jwt_identity()
        apenas_nao_lidas = request.args.get('nao_lidas', 'false').lower() == 'true'

        filtro = {'id_usuario': user_id}
        if apenas_nao_lidas:
            filtro['lida'] = False

        notificacoes = list(database.notificacoes_collection.find(
            filtro,
            {'_id': 0}
        ).sort('data_criacao', -1).limit(50))

        return jsonify({'notificacoes': notificacoes}), 200
    except Exception as e:
        print(f"Erro ao obter notificações: {e}")
        return jsonify({'notificacoes': []}), 200


@utils_bp.route('/notificacoes/marcar-todas-lidas', methods=['PUT'])
@jwt_required()
def marcar_todas_lidas():
    """Marcar todas as notificações como lidas"""
    if database.mongo_db is None or database.notificacoes_collection is None:
        return jsonify({'mensagem': 'MongoDB não disponível'}), 200

    try:
        user_id = get_jwt_identity()

        result = database.notificacoes_collection.update_many(
            {'id_usuario': user_id, 'lida': False},
            {'$set': {'lida': True}}
        )

        return jsonify({
            'mensagem': f'{result.modified_count} notificações marcadas como lidas'
        }), 200
    except Exception as e:
        print(f"Erro ao marcar notificações: {e}")
        return jsonify({'erro': 'Erro ao marcar notificações'}), 500


# ============================================
# HEALTH CHECK
# ============================================

@utils_bp.route('/health', methods=['GET'])
def health_check():
    """Verificar saúde do sistema"""
    try:
        # Testar MySQL
        mysql_ok = False
        try:
            result = execute_query("SELECT 1 as test")
            mysql_ok = result is not None
        except:
            pass

        # Testar MongoDB
        mongodb_ok = database.mongo_db is not None

        return jsonify({
            'status': 'healthy' if mysql_ok else 'degraded',
            'mysql': 'connected' if mysql_ok else 'disconnected',
            'mongodb': 'connected' if mongodb_ok else 'disconnected'
        }), 200
    except Exception as e:
        return jsonify({'status': 'unhealthy', 'erro': str(e)}), 500


# ============================================
# VIEWS E QUERIES ESPECIAIS
# ============================================

@utils_bp.route('/animes/populares', methods=['GET'])
def animes_populares():
    """Animes mais populares - USA VIEW"""
    try:
        query = "SELECT * FROM vw_animes_populares LIMIT 20"
        animes = execute_query(query)
        return jsonify({'animes': animes or []}), 200
    except Exception as e:
        print(f"Erro ao buscar populares: {e}")
        return jsonify({'erro': 'Erro ao buscar animes populares'}), 500


@utils_bp.route('/animes/temporada', methods=['GET'])
def animes_temporada():
    """Animes da temporada atual - USA VIEW"""
    try:
        query = "SELECT * FROM vw_animes_temporada_atual"
        animes = execute_query(query)
        return jsonify({'animes': animes or []}), 200
    except Exception as e:
        print(f"Erro ao buscar temporada: {e}")
        return jsonify({'erro': 'Erro ao buscar animes da temporada'}), 500

