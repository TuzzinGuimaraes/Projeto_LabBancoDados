"""
Blueprint de moderação.
"""
from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required

from database import execute_query
from decorators import moderator_or_admin_required

moderacao_bp = Blueprint('moderacao', __name__)


@moderacao_bp.route('/avaliacoes', methods=['GET'])
@jwt_required()
@moderator_or_admin_required
def listar_avaliacoes_moderacao():
    """Listar avaliações para moderação."""
    try:
        query = """
            SELECT
                av.*,
                u.nome_completo,
                m.titulo_portugues,
                m.titulo_original,
                tm.nome_tipo AS tipo
            FROM avaliacoes av
            JOIN usuarios u ON av.id_usuario = u.id_usuario
            JOIN midias m ON av.id_midia = m.id_midia
            JOIN tipo_midia tm ON m.id_tipo = tm.id_tipo
            ORDER BY av.data_avaliacao DESC
            LIMIT 50
        """
        avaliacoes = execute_query(query)
        return jsonify({'avaliacoes': avaliacoes or []}), 200
    except Exception as exc:
        print(f"Erro ao listar avaliações: {exc}")
        return jsonify({'erro': 'Erro ao buscar avaliações'}), 500


@moderacao_bp.route('/usuarios', methods=['GET'])
@jwt_required()
@moderator_or_admin_required
def listar_usuarios_moderacao():
    """Listar usuários para moderação."""
    try:
        query = """
            SELECT
                u.id_usuario,
                u.nome_completo,
                u.email,
                u.data_cadastro,
                u.ultimo_acesso,
                u.ativo,
                GROUP_CONCAT(DISTINCT gu.nome_grupo SEPARATOR ', ') AS grupos,
                COUNT(DISTINCT lu.id_midia) AS total_midias,
                COUNT(DISTINCT CASE WHEN tm.nome_tipo = 'anime' THEN lu.id_midia END) AS total_animes,
                COUNT(DISTINCT av.id_avaliacao) AS total_avaliacoes
            FROM usuarios u
            LEFT JOIN usuarios_grupos ug ON u.id_usuario = ug.id_usuario
            LEFT JOIN grupos_usuarios gu ON ug.id_grupo = gu.id_grupo
            LEFT JOIN lista_usuarios lu ON u.id_usuario = lu.id_usuario
            LEFT JOIN midias m ON lu.id_midia = m.id_midia
            LEFT JOIN tipo_midia tm ON m.id_tipo = tm.id_tipo
            LEFT JOIN avaliacoes av ON u.id_usuario = av.id_usuario
            GROUP BY u.id_usuario
            ORDER BY u.data_cadastro DESC
            LIMIT 100
        """
        usuarios = execute_query(query)
        return jsonify({'usuarios': usuarios or []}), 200
    except Exception as exc:
        print(f"Erro ao listar usuários: {exc}")
        return jsonify({'erro': 'Erro ao buscar usuários'}), 500


@moderacao_bp.route('/usuarios/<string:target_user_id>/desativar', methods=['PUT'])
@jwt_required()
@moderator_or_admin_required
def desativar_usuario(target_user_id):
    """Desativar usuário."""
    try:
        execute_query("UPDATE usuarios SET ativo = FALSE WHERE id_usuario = %s", (target_user_id,), fetch=False)
        return jsonify({'mensagem': 'Usuário desativado com sucesso'}), 200
    except Exception as exc:
        print(f"Erro ao desativar usuário: {exc}")
        return jsonify({'erro': 'Erro ao desativar usuário'}), 500


@moderacao_bp.route('/usuarios/<string:target_user_id>/ativar', methods=['PUT'])
@jwt_required()
@moderator_or_admin_required
def ativar_usuario(target_user_id):
    """Ativar usuário."""
    try:
        execute_query("UPDATE usuarios SET ativo = TRUE WHERE id_usuario = %s", (target_user_id,), fetch=False)
        return jsonify({'mensagem': 'Usuário ativado com sucesso'}), 200
    except Exception as exc:
        print(f"Erro ao ativar usuário: {exc}")
        return jsonify({'erro': 'Erro ao ativar usuário'}), 500
