"""
Blueprint de Moderação
Endpoints para moderadores e admins
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required
from database import execute_query
from decorators import moderator_or_admin_required

moderacao_bp = Blueprint('moderacao', __name__)

@moderacao_bp.route('/avaliacoes', methods=['GET'])
@jwt_required()
@moderator_or_admin_required
def listar_avaliacoes_moderacao():
    """Listar todas avaliações para moderação"""
    try:
        query = """
                SELECT av.*,
                       u.nome_completo,
                       a.titulo_portugues,
                       a.titulo_original
                FROM avaliacoes av
                         JOIN usuarios u ON av.id_usuario = u.id_usuario
                         JOIN animes a ON av.id_anime = a.id_anime
                ORDER BY av.data_avaliacao DESC
                LIMIT 50
                """

        avaliacoes = execute_query(query)
        return jsonify({'avaliacoes': avaliacoes or []}), 200
    except Exception as e:
        print(f"Erro ao listar avaliações: {e}")
        return jsonify({'erro': 'Erro ao buscar avaliações'}), 500


@moderacao_bp.route('/usuarios', methods=['GET'])
@jwt_required()
@moderator_or_admin_required
def listar_usuarios_moderacao():
    """Listar usuários para moderação"""
    try:
        query = """
                SELECT u.id_usuario,
                       u.nome_completo,
                       u.email,
                       u.data_cadastro,
                       u.ultimo_acesso,
                       u.ativo,
                       GROUP_CONCAT(DISTINCT gu.nome_grupo SEPARATOR ', ') as grupos,
                       COUNT(DISTINCT lu.id_anime) as total_animes,
                       COUNT(DISTINCT av.id_avaliacao) as total_avaliacoes
                FROM usuarios u
                         LEFT JOIN usuarios_grupos ug ON u.id_usuario = ug.id_usuario
                         LEFT JOIN grupos_usuarios gu ON ug.id_grupo = gu.id_grupo
                         LEFT JOIN lista_usuarios lu ON u.id_usuario = lu.id_usuario
                         LEFT JOIN avaliacoes av ON u.id_usuario = av.id_usuario
                GROUP BY u.id_usuario
                ORDER BY u.data_cadastro DESC
                LIMIT 100
                """

        usuarios = execute_query(query)
        return jsonify({'usuarios': usuarios or []}), 200
    except Exception as e:
        print(f"Erro ao listar usuários: {e}")
        return jsonify({'erro': 'Erro ao buscar usuários'}), 500


@moderacao_bp.route('/usuarios/<string:target_user_id>/desativar', methods=['PUT'])
@jwt_required()
@moderator_or_admin_required
def desativar_usuario(target_user_id):
    """Desativar usuário"""
    try:
        query = "UPDATE usuarios SET ativo = FALSE WHERE id_usuario = %s"
        execute_query(query, (target_user_id,), fetch=False)
        return jsonify({'mensagem': 'Usuário desativado com sucesso'}), 200
    except Exception as e:
        print(f"Erro ao desativar usuário: {e}")
        return jsonify({'erro': 'Erro ao desativar usuário'}), 500


@moderacao_bp.route('/usuarios/<string:target_user_id>/ativar', methods=['PUT'])
@jwt_required()
@moderator_or_admin_required
def ativar_usuario(target_user_id):
    """Ativar usuário"""
    try:
        query = "UPDATE usuarios SET ativo = TRUE WHERE id_usuario = %s"
        execute_query(query, (target_user_id,), fetch=False)
        return jsonify({'mensagem': 'Usuário ativado com sucesso'}), 200
    except Exception as e:
        print(f"Erro ao ativar usuário: {e}")
        return jsonify({'erro': 'Erro ao ativar usuário'}), 500

