"""
Blueprint de avaliações.
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import get_jwt_identity, jwt_required

from database import execute_query
from decorators import get_user_permissions
from repositories import MidiaRepository

avaliacoes_bp = Blueprint('avaliacoes', __name__)

midia_repository = MidiaRepository()


@avaliacoes_bp.route('/<string:id_midia>', methods=['GET'])
def listar_avaliacoes(id_midia):
    """Listar avaliações de uma mídia."""
    try:
        if not midia_repository.buscar_por_id(id_midia):
            return jsonify({'erro': 'Mídia não encontrada'}), 404
        avaliacoes = midia_repository.obter_avaliacoes(id_midia)
        return jsonify({'avaliacoes': avaliacoes or []}), 200
    except Exception as exc:
        print(f"Erro ao listar avaliações: {exc}")
        return jsonify({'erro': 'Erro ao buscar avaliações'}), 500


@avaliacoes_bp.route('', methods=['POST'])
@jwt_required()
def criar_avaliacao():
    """Criar avaliação."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}
        id_midia = data.get('id_midia') or data.get('id_anime')

        if not id_midia or not data.get('nota'):
            return jsonify({'erro': 'ID da mídia e nota são obrigatórios'}), 400

        if not midia_repository.buscar_por_id(id_midia):
            return jsonify({'erro': 'Mídia não encontrada'}), 404

        check_query = """
            SELECT id_avaliacao
            FROM avaliacoes
            WHERE id_usuario = %s AND id_midia = %s
        """
        existing = execute_query(check_query, (user_id, id_midia))
        if existing:
            return jsonify({'erro': 'Você já avaliou esta mídia'}), 400

        query = """
            INSERT INTO avaliacoes (id_usuario, id_midia, nota, titulo_avaliacao, texto_avaliacao)
            VALUES (%s, %s, %s, %s, %s)
        """
        params = (
            user_id,
            id_midia,
            data['nota'],
            data.get('titulo_avaliacao'),
            data.get('texto_avaliacao'),
        )
        execute_query(query, params, fetch=False)

        avaliacao = execute_query(check_query, (user_id, id_midia))
        midia = execute_query("SELECT nota_media, total_avaliacoes FROM midias WHERE id_midia = %s", (id_midia,))

        return jsonify({
            'mensagem': 'Avaliação criada com sucesso!',
            'id_avaliacao': avaliacao[0]['id_avaliacao'] if avaliacao else None,
            'nota_media_atualizada': midia[0]['nota_media'] if midia else None,
            'total_avaliacoes': midia[0]['total_avaliacoes'] if midia else None,
        }), 201
    except Exception as exc:
        print(f"Erro ao criar avaliação: {exc}")
        if 'Duplicate entry' in str(exc) or '1062' in str(exc):
            return jsonify({'erro': 'Você já avaliou esta mídia'}), 400
        return jsonify({'erro': 'Erro ao criar avaliação'}), 500


@avaliacoes_bp.route('/<string:avaliacao_id>', methods=['PUT'])
@jwt_required()
def editar_avaliacao(avaliacao_id):
    """Editar avaliação."""
    try:
        user_id = get_jwt_identity()
        data = request.get_json() or {}
        if not data:
            return jsonify({'erro': 'Dados não fornecidos'}), 400

        check_query = "SELECT id_usuario, id_midia FROM avaliacoes WHERE id_avaliacao = %s"
        result = execute_query(check_query, (avaliacao_id,))
        if not result or result[0]['id_usuario'] != user_id:
            return jsonify({'erro': 'Avaliação não encontrada ou sem permissão'}), 403

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
        execute_query(
            f"UPDATE avaliacoes SET {', '.join(fields)} WHERE id_avaliacao = %s",
            params,
            fetch=False,
        )

        id_midia = result[0]['id_midia']
        midia = execute_query("SELECT nota_media FROM midias WHERE id_midia = %s", (id_midia,))

        return jsonify({
            'mensagem': 'Avaliação atualizada com sucesso!',
            'nota_media_atualizada': midia[0]['nota_media'] if midia else None,
        }), 200
    except Exception as exc:
        print(f"Erro ao editar avaliação: {exc}")
        return jsonify({'erro': 'Erro ao editar avaliação'}), 500


@avaliacoes_bp.route('/<string:avaliacao_id>', methods=['DELETE'])
@jwt_required()
def deletar_avaliacao(avaliacao_id):
    """Deletar avaliação."""
    try:
        user_id = get_jwt_identity()
        permissions = get_user_permissions(user_id)

        result = execute_query("SELECT id_usuario FROM avaliacoes WHERE id_avaliacao = %s", (avaliacao_id,))
        if not result:
            return jsonify({'erro': 'Avaliação não encontrada'}), 404

        if result[0]['id_usuario'] != user_id and not permissions['pode_moderar']:
            return jsonify({'erro': 'Sem permissão para deletar esta avaliação'}), 403

        execute_query("DELETE FROM avaliacoes WHERE id_avaliacao = %s", (avaliacao_id,), fetch=False)
        return jsonify({'mensagem': 'Avaliação removida com sucesso'}), 200
    except Exception as exc:
        print(f"Erro ao deletar avaliação: {exc}")
        return jsonify({'erro': 'Erro ao deletar avaliação'}), 500
