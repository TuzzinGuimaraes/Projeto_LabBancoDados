"""
Blueprint de Usuário
Endpoints de perfil, permissões e estatísticas
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import execute_query, call_procedure
from decorators import get_user_permissions

usuario_bp = Blueprint('usuario', __name__)

@usuario_bp.route('/perfil', methods=['GET'])
@jwt_required()
def obter_perfil():
    """Obter perfil completo - USA VIEW vw_perfil_usuario"""
    try:
        user_id = get_jwt_identity()
        query = "SELECT * FROM vw_perfil_usuario WHERE id_usuario = %s"
        perfil = execute_query(query, (user_id,))

        if not perfil:
            return jsonify({'erro': 'Perfil não encontrado'}), 404

        return jsonify({'perfil': perfil[0]}), 200
    except Exception as e:
        print(f"Erro ao obter perfil: {e}")
        return jsonify({'erro': 'Erro ao buscar perfil'}), 500


@usuario_bp.route('/permissoes', methods=['GET'])
@jwt_required()
def obter_permissoes():
    """Obter permissões do usuário"""
    try:
        user_id = get_jwt_identity()
        permissions = get_user_permissions(user_id)
        return jsonify({'permissoes': permissions}), 200
    except Exception as e:
        print(f"Erro ao obter permissões: {e}")
        return jsonify({'erro': 'Erro ao buscar permissões'}), 500


@usuario_bp.route('/estatisticas', methods=['GET'])
@jwt_required()
def obter_estatisticas():
    """Obter estatísticas do usuário - USA PROCEDURE obter_estatisticas_usuario"""
    try:
        user_id = get_jwt_identity()
        result = call_procedure('obter_estatisticas_usuario', (user_id,))

        if not result:
            return jsonify({'erro': 'Erro ao obter estatísticas'}), 500

        return jsonify({'estatisticas': result[0]}), 200
    except Exception as e:
        print(f"Erro ao obter estatísticas: {e}")
        return jsonify({'erro': 'Erro ao buscar estatísticas'}), 500

