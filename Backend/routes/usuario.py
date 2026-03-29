"""
Blueprint de usuário.
"""
from flask import Blueprint, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required

from database import call_procedure, execute_query
from decorators import get_user_permissions

usuario_bp = Blueprint('usuario', __name__)


@usuario_bp.route('/perfil', methods=['GET'])
@jwt_required()
def obter_perfil():
    """Obter perfil completo do usuário."""
    try:
        user_id = get_jwt_identity()
        perfil = execute_query("SELECT * FROM vw_perfil_usuario WHERE id_usuario = %s", (user_id,))
        if not perfil:
            return jsonify({'erro': 'Perfil não encontrado'}), 404
        return jsonify({'perfil': perfil[0]}), 200
    except Exception as exc:
        print(f"Erro ao obter perfil: {exc}")
        return jsonify({'erro': 'Erro ao buscar perfil'}), 500


@usuario_bp.route('/permissoes', methods=['GET'])
@jwt_required()
def obter_permissoes():
    """Obter permissões do usuário."""
    try:
        permissions = get_user_permissions(get_jwt_identity())
        return jsonify({'permissoes': permissions}), 200
    except Exception as exc:
        print(f"Erro ao obter permissões: {exc}")
        return jsonify({'erro': 'Erro ao buscar permissões'}), 500


@usuario_bp.route('/estatisticas', methods=['GET'])
@jwt_required()
def obter_estatisticas():
    """Obter estatísticas do usuário por tipo de mídia."""
    try:
        user_id = get_jwt_identity()
        result = call_procedure('obter_estatisticas_usuario', (user_id,))
        if result is None:
            return jsonify({'erro': 'Erro ao obter estatísticas'}), 500

        resumo = {
            'total_midias': sum(item.get('total_midias') or 0 for item in result),
            'concluidos': sum(item.get('concluidos') or 0 for item in result),
            'em_andamento': sum(item.get('em_andamento') or 0 for item in result),
            'favoritos': sum(item.get('favoritos') or 0 for item in result),
        }
        return jsonify({'estatisticas': result, 'resumo': resumo}), 200
    except Exception as exc:
        print(f"Erro ao obter estatísticas: {exc}")
        return jsonify({'erro': 'Erro ao buscar estatísticas'}), 500
