"""
Blueprint de Avaliações
Endpoints para avaliações de animes
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import execute_query
from decorators import get_user_permissions

avaliacoes_bp = Blueprint('avaliacoes', __name__)

@avaliacoes_bp.route('/<string:anime_id>', methods=['GET'])
def listar_avaliacoes(anime_id):
    """Listar avaliações de um anime"""
    try:
        query = """
                SELECT av.*,
                       u.nome_completo,
                       u.foto_perfil
                FROM avaliacoes av
                         JOIN usuarios u ON av.id_usuario = u.id_usuario
                WHERE av.id_anime = %s
                ORDER BY av.data_avaliacao DESC
                """

        avaliacoes = execute_query(query, (anime_id,))
        return jsonify({'avaliacoes': avaliacoes or []}), 200
    except Exception as e:
        print(f"Erro ao listar avaliações: {e}")
        return jsonify({'erro': 'Erro ao buscar avaliações'}), 500


@avaliacoes_bp.route('', methods=['POST'])
@jwt_required()
def criar_avaliacao():
    """Criar avaliação - TRIGGER atualiza nota média"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        if not data or not data.get('id_anime') or not data.get('nota'):
            return jsonify({'erro': 'ID do anime e nota são obrigatórios'}), 400

        # Verificar se já existe avaliação
        check_query = """
            SELECT id_avaliacao FROM avaliacoes 
            WHERE id_usuario = %s AND id_anime = %s
        """
        existing = execute_query(check_query, (user_id, data['id_anime']))

        if existing:
            return jsonify({'erro': 'Você já avaliou este anime'}), 400

        # Inserir avaliação
        query = """
                INSERT INTO avaliacoes (id_usuario, id_anime, nota, titulo_avaliacao, texto_avaliacao)
                VALUES (%s, %s, %s, %s, %s)
                """

        params = (
            user_id,
            data['id_anime'],
            data['nota'],
            data.get('titulo_avaliacao'),
            data.get('texto_avaliacao')
        )

        execute_query(query, params, fetch=False)

        # Buscar a avaliação recém criada para pegar o ID
        avaliacao_query = """
            SELECT id_avaliacao FROM avaliacoes 
            WHERE id_usuario = %s AND id_anime = %s
        """
        avaliacao_result = execute_query(avaliacao_query, (user_id, data['id_anime']))
        avaliacao_id = avaliacao_result[0]['id_avaliacao'] if avaliacao_result else None

        # Buscar nota média atualizada
        anime_query = "SELECT nota_media, total_avaliacoes FROM animes WHERE id_anime = %s"
        anime_result = execute_query(anime_query, (data['id_anime'],))

        return jsonify({
            'mensagem': 'Avaliação criada com sucesso!',
            'id_avaliacao': avaliacao_id,
            'nota_media_atualizada': anime_result[0]['nota_media'] if anime_result else None,
            'total_avaliacoes': anime_result[0]['total_avaliacoes'] if anime_result else None
        }), 201
    except Exception as e:
        print(f"Erro ao criar avaliação: {e}")
        # Verificar se é erro de duplicata
        if 'Duplicate entry' in str(e) or '1062' in str(e):
            return jsonify({'erro': 'Você já avaliou este anime'}), 400
        return jsonify({'erro': 'Erro ao criar avaliação'}), 500


@avaliacoes_bp.route('/<string:avaliacao_id>', methods=['PUT'])
@jwt_required()
def editar_avaliacao(avaliacao_id):
    """Editar avaliação - TRIGGER atualiza nota média"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        if not data:
            return jsonify({'erro': 'Dados não fornecidos'}), 400

        check_query = "SELECT id_usuario, id_anime FROM avaliacoes WHERE id_avaliacao = %s"
        result = execute_query(check_query, (avaliacao_id,))

        if not result or result[0]['id_usuario'] != user_id:
            return jsonify({'erro': 'Avaliação não encontrada ou sem permissão'}), 403

        id_anime = result[0]['id_anime']
        fields = []
        params = []

        if 'nota' in data:
            fields.append("nota = %s")
            params.append(data['nota'])

        if 'titulo_avaliacao' in data:
            fields.append("titulo_avaliacao = %s")
            params.append(data['titulo_avaliacao'])

        if 'texto_avaliacao' in data:
            fields.append("texto_avaliacao = %s")
            params.append(data['texto_avaliacao'])

        if not fields:
            return jsonify({'erro': 'Nenhum campo para atualizar'}), 400

        fields.append("data_edicao = NOW()")
        params.append(avaliacao_id)

        query = f"UPDATE avaliacoes SET {', '.join(fields)} WHERE id_avaliacao = %s"
        execute_query(query, params, fetch=False)

        # Buscar nota média atualizada
        anime_query = "SELECT nota_media FROM animes WHERE id_anime = %s"
        anime_result = execute_query(anime_query, (id_anime,))

        return jsonify({
            'mensagem': 'Avaliação atualizada com sucesso!',
            'nota_media_atualizada': anime_result[0]['nota_media'] if anime_result else None
        }), 200
    except Exception as e:
        print(f"Erro ao editar avaliação: {e}")
        return jsonify({'erro': 'Erro ao editar avaliação'}), 500


@avaliacoes_bp.route('/<string:avaliacao_id>', methods=['DELETE'])
@jwt_required()
def deletar_avaliacao(avaliacao_id):
    """Deletar avaliação"""
    try:
        user_id = get_jwt_identity()
        permissions = get_user_permissions(user_id)

        check_query = "SELECT id_usuario, id_anime FROM avaliacoes WHERE id_avaliacao = %s"
        result = execute_query(check_query, (avaliacao_id,))

        if not result:
            return jsonify({'erro': 'Avaliação não encontrada'}), 404

        if result[0]['id_usuario'] != user_id and not permissions['pode_moderar']:
            return jsonify({'erro': 'Sem permissão para deletar esta avaliação'}), 403

        query = "DELETE FROM avaliacoes WHERE id_avaliacao = %s"
        execute_query(query, (avaliacao_id,), fetch=False)

        return jsonify({'mensagem': 'Avaliação removida com sucesso'}), 200
    except Exception as e:
        print(f"Erro ao deletar avaliação: {e}")
        return jsonify({'erro': 'Erro ao deletar avaliação'}), 500

