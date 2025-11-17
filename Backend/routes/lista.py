"""
Blueprint de Lista do Usuário
Endpoints para gerenciar lista pessoal de animes
"""
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from database import execute_query, call_procedure

lista_bp = Blueprint('lista', __name__)

@lista_bp.route('', methods=['GET'])
@jwt_required()
def obter_lista_usuario():
    """Obter lista de animes do usuário"""
    try:
        user_id = get_jwt_identity()
        status = request.args.get('status')

        query = """
                SELECT lu.*,
                       a.titulo_portugues,
                       a.titulo_original,
                       a.poster_url,
                       a.numero_episodios,
                       a.status_anime,
                       a.nota_media
                FROM lista_usuarios lu
                         JOIN animes a ON lu.id_anime = a.id_anime
                WHERE lu.id_usuario = %s
                """
        params = [user_id]

        if status:
            query += " AND lu.status_visualizacao = %s"
            params.append(status)

        query += " ORDER BY lu.data_atualizacao DESC"

        lista = execute_query(query, params)

        return jsonify({'lista': lista or []}), 200
    except Exception as e:
        print(f"Erro ao obter lista: {e}")
        return jsonify({'erro': 'Erro ao buscar lista'}), 500


@lista_bp.route('/adicionar', methods=['POST'])
@jwt_required()
def adicionar_anime_lista():
    """Adicionar anime à lista - USA PROCEDURE"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        if not data or not data.get('id_anime'):
            return jsonify({'erro': 'ID do anime é obrigatório'}), 400

        id_anime = data['id_anime']
        status = data.get('status', 'planejado')

        # Verificar se anime existe
        check_anime = execute_query("SELECT id_anime FROM animes WHERE id_anime = %s", (id_anime,))
        if not check_anime:
            return jsonify({'erro': 'Anime não encontrado'}), 404

        # Usar procedure
        result = call_procedure('adicionar_anime_lista', [user_id, id_anime, status])

        if result and 'mensagem' in result[0]:
            mensagem = result[0]['mensagem']
            if 'já está na lista' in mensagem:
                return jsonify({'erro': mensagem}), 400
            return jsonify({'mensagem': mensagem}), 201

        return jsonify({'mensagem': 'Anime adicionado à lista!'}), 201
    except Exception as e:
        print(f"Erro ao adicionar à lista: {e}")
        return jsonify({'erro': f'Erro ao adicionar anime: {str(e)}'}), 500


@lista_bp.route('', methods=['POST'])
@jwt_required()
def adicionar_anime_lista_v2():
    """Adicionar anime à lista (endpoint alternativo sem /adicionar)"""
    return adicionar_anime_lista()


@lista_bp.route('/<string:lista_id>/progresso', methods=['PUT'])
@jwt_required()
def atualizar_progresso(lista_id):
    """Atualizar progresso - USA PROCEDURE"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        if not data or 'episodios_assistidos' not in data:
            return jsonify({'erro': 'Número de episódios é obrigatório'}), 400

        # Verificar permissão
        check_query = "SELECT id_usuario FROM lista_usuarios WHERE id_lista = %s"
        result = execute_query(check_query, (lista_id,))

        if not result or result[0]['id_usuario'] != user_id:
            return jsonify({'erro': 'Item não encontrado ou sem permissão'}), 403

        # Usar procedure
        result = call_procedure('atualizar_progresso_anime', [
            lista_id,
            int(data['episodios_assistidos']),
            data.get('novo_status', 'assistindo')
        ])

        return jsonify({'mensagem': 'Progresso atualizado com sucesso!'}), 200
    except Exception as e:
        print(f"Erro ao atualizar progresso: {e}")
        return jsonify({'erro': f'Erro ao atualizar: {str(e)}'}), 500


@lista_bp.route('/<string:lista_id>', methods=['PUT'])
@jwt_required()
def atualizar_item_lista(lista_id):
    """Atualizar item da lista"""
    try:
        user_id = get_jwt_identity()
        data = request.get_json()

        if not data:
            return jsonify({'erro': 'Dados não fornecidos'}), 400

        # Verificar permissão
        check_query = "SELECT id_usuario FROM lista_usuarios WHERE id_lista = %s"
        result = execute_query(check_query, (lista_id,))

        if not result or result[0]['id_usuario'] != user_id:
            return jsonify({'erro': 'Item não encontrado ou sem permissão'}), 403

        # Se for atualização de episódios, usar procedure
        if 'episodios_assistidos' in data:
            result = call_procedure('atualizar_progresso_anime', [
                lista_id,
                int(data['episodios_assistidos']),
                data.get('status_visualizacao', 'assistindo')
            ])
            return jsonify({'mensagem': 'Progresso atualizado!'}), 200

        # Atualização de outros campos
        fields = []
        params = []

        if 'status_visualizacao' in data:
            fields.append("status_visualizacao = %s")
            params.append(data['status_visualizacao'])

        if 'nota_usuario' in data:
            nota = data['nota_usuario']
            if nota is not None and nota != '':
                fields.append("nota_usuario = %s")
                params.append(float(nota))
            else:
                fields.append("nota_usuario = NULL")

        if 'favorito' in data:
            fields.append("favorito = %s")
            params.append(bool(data['favorito']))

        if 'comentario' in data:
            fields.append("comentario = %s")
            params.append(data['comentario'])

        if not fields:
            return jsonify({'erro': 'Nenhum campo para atualizar'}), 400

        fields.append("data_atualizacao = NOW()")
        params.append(lista_id)
        query = f"UPDATE lista_usuarios SET {', '.join(fields)} WHERE id_lista = %s"

        execute_query(query, params, fetch=False)

        return jsonify({'mensagem': 'Lista atualizada com sucesso!'}), 200
    except Exception as e:
        print(f"Erro ao atualizar lista: {e}")
        return jsonify({'erro': f'Erro ao atualizar: {str(e)}'}), 500


@lista_bp.route('/<string:lista_id>', methods=['DELETE'])
@jwt_required()
def remover_anime_lista(lista_id):
    """Remover anime da lista"""
    try:
        user_id = get_jwt_identity()
        query = "DELETE FROM lista_usuarios WHERE id_lista = %s AND id_usuario = %s"
        execute_query(query, (lista_id, user_id), fetch=False)
        return jsonify({'mensagem': 'Anime removido da lista'}), 200
    except Exception as e:
        print(f"Erro ao remover da lista: {e}")
        return jsonify({'erro': 'Erro ao remover anime'}), 500

