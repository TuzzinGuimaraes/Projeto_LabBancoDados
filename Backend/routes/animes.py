"""
Blueprint de Animes
Endpoints para CRUD de animes, gêneros e atualizações
"""
import database
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime
from database import execute_query, get_db_connection
from decorators import permission_required, get_user_permissions

animes_bp = Blueprint('animes', __name__)

# ============================================
# ENDPOINTS DE ANIMES
# ============================================

@animes_bp.route('', methods=['GET'])
def listar_animes():
    """Listar todos os animes com filtros"""
    try:
        status = request.args.get('status')
        genero = request.args.get('genero')
        busca = request.args.get('busca')
        ordem = request.args.get('ordem', 'nota_media')
        pagina = int(request.args.get('pagina', 1))
        por_pagina = int(request.args.get('por_pagina', 20))

        query = """
                SELECT a.*, 
                       GROUP_CONCAT(DISTINCT g.nome_genero SEPARATOR ', ') as generos,
                       COUNT(DISTINCT lu.id_usuario) as total_usuarios
                FROM animes a
                         LEFT JOIN animes_generos ag ON a.id_anime = ag.id_anime
                         LEFT JOIN generos g ON ag.id_genero = g.id_genero
                         LEFT JOIN lista_usuarios lu ON a.id_anime = lu.id_anime
                WHERE 1 = 1
                """
        params = []

        if status:
            query += " AND a.status_anime = %s"
            params.append(status)

        if genero:
            query += " AND EXISTS (SELECT 1 FROM animes_generos ag2 JOIN generos g2 ON ag2.id_genero = g2.id_genero WHERE ag2.id_anime = a.id_anime AND g2.nome_genero = %s)"
            params.append(genero)

        if busca:
            query += " AND (a.titulo_portugues LIKE %s OR a.titulo_original LIKE %s OR a.sinopse LIKE %s)"
            search_term = f"%{busca}%"
            params.extend([search_term, search_term, search_term])

        query += " GROUP BY a.id_anime"

        if ordem == 'nota_media':
            query += " ORDER BY a.nota_media DESC"
        elif ordem == 'data_lancamento':
            query += " ORDER BY a.data_lancamento DESC"
        elif ordem == 'titulo':
            query += " ORDER BY a.titulo_portugues ASC"
        else:
            query += " ORDER BY total_usuarios DESC"

        offset = (pagina - 1) * por_pagina
        query += f" LIMIT {por_pagina} OFFSET {offset}"

        animes = execute_query(query, params)

        return jsonify({
            'animes': animes or [],
            'pagina': pagina,
            'por_pagina': por_pagina
        }), 200
    except Exception as e:
        print(f"Erro ao listar animes: {e}")
        return jsonify({'erro': 'Erro ao buscar animes'}), 500


@animes_bp.route('/<string:anime_id>', methods=['GET'])
def detalhes_anime(anime_id):
    """Obter detalhes completos de um anime"""
    try:
        query = """
                SELECT a.*,
                       GROUP_CONCAT(DISTINCT g.nome_genero SEPARATOR ', ') as generos,
                       COUNT(DISTINCT lu.id_usuario) as total_usuarios,
                       COUNT(DISTINCT av.id_avaliacao) as total_avaliacoes
                FROM animes a
                         LEFT JOIN animes_generos ag ON a.id_anime = ag.id_anime
                         LEFT JOIN generos g ON ag.id_genero = g.id_genero
                         LEFT JOIN lista_usuarios lu ON a.id_anime = lu.id_anime
                         LEFT JOIN avaliacoes av ON a.id_anime = av.id_anime
                WHERE a.id_anime = %s
                GROUP BY a.id_anime
                """

        anime = execute_query(query, (anime_id,))

        if not anime:
            return jsonify({'erro': 'Anime não encontrado'}), 404

        # Buscar atualizações no MongoDB
        atualizacoes = []
        if database.mongo_db is not None and database.atualizacoes_collection:
            try:
                atualizacoes = list(database.atualizacoes_collection.find(
                    {'id_anime': anime_id},
                    {'_id': 0}
                ).sort('data_atualizacao', -1).limit(10))
            except:
                pass

        return jsonify({
            **anime[0],
            'atualizacoes': atualizacoes
        }), 200
    except Exception as e:
        print(f"Erro ao buscar detalhes: {e}")
        return jsonify({'erro': 'Erro ao buscar detalhes do anime'}), 500


@animes_bp.route('', methods=['POST'])
@jwt_required()
@permission_required('criar')
def criar_anime():
    """Criar novo anime"""
    try:
        user_id = get_jwt_identity()
        permissions = get_user_permissions(user_id)
        data = request.get_json()

        if not data or not data.get('titulo_original'):
            return jsonify({'erro': 'Título original é obrigatório'}), 400

        query = """
                INSERT INTO animes (titulo_original, titulo_portugues, titulo_ingles, sinopse,
                                    data_lancamento, status_anime, numero_episodios, duracao_episodio,
                                    classificacao_etaria, estudio, fonte_original, poster_url, banner_url, trailer_url)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                """

        params = (
            data['titulo_original'],
            data.get('titulo_portugues'),
            data.get('titulo_ingles'),
            data.get('sinopse'),
            data.get('data_lancamento'),
            data.get('status_anime', 'aguardando'),
            data.get('numero_episodios'),
            data.get('duracao_episodio'),
            data.get('classificacao_etaria'),
            data.get('estudio'),
            data.get('fonte_original'),
            data.get('poster_url'),
            data.get('banner_url'),
            data.get('trailer_url')
        )

        connection = get_db_connection()
        if not connection:
            return jsonify({'erro': 'Erro ao conectar ao banco'}), 500

        try:
            cursor = connection.cursor(dictionary=True)
            cursor.execute(query, params)
            connection.commit()

            cursor.execute("SELECT id_anime, codigo_anime FROM animes WHERE titulo_original = %s ORDER BY data_criacao DESC LIMIT 1",
                          (data['titulo_original'],))
            result = cursor.fetchone()
            cursor.close()
            connection.close()

            if not result:
                return jsonify({'erro': 'Erro ao criar anime'}), 500

            anime_id = result['id_anime']
            codigo_anime = result['codigo_anime']
        except Exception as e:
            if connection:
                connection.close()
            print(f"Erro ao criar anime: {e}")
            return jsonify({'erro': 'Erro ao criar anime'}), 500

        # Adicionar gêneros
        if 'generos' in data and data['generos']:
            for genero_id in data['generos']:
                query_genero = "INSERT INTO animes_generos (id_anime, id_genero) VALUES (%s, %s)"
                execute_query(query_genero, (anime_id, genero_id), fetch=False)

        return jsonify({
            'mensagem': 'Anime criado com sucesso!',
            'id_anime': anime_id,
            'codigo_anime': codigo_anime,
            'criado_por': permissions['nivel_acesso']
        }), 201
    except Exception as e:
        print(f"Erro ao criar anime: {e}")
        return jsonify({'erro': 'Erro ao criar anime'}), 500


@animes_bp.route('/<string:anime_id>', methods=['PUT'])
@jwt_required()
@permission_required('editar')
def editar_anime(anime_id):
    """Editar anime"""
    try:
        data = request.get_json()
        if not data:
            return jsonify({'erro': 'Dados não fornecidos'}), 400

        fields = []
        params = []

        editable_fields = {
            'titulo_portugues': 'titulo_portugues',
            'titulo_ingles': 'titulo_ingles',
            'sinopse': 'sinopse',
            'status_anime': 'status_anime',
            'numero_episodios': 'numero_episodios',
            'poster_url': 'poster_url',
            'banner_url': 'banner_url',
            'trailer_url': 'trailer_url'
        }

        for field, column in editable_fields.items():
            if field in data:
                fields.append(f"{column} = %s")
                params.append(data[field])

        if not fields:
            return jsonify({'erro': 'Nenhum campo para atualizar'}), 400

        params.append(anime_id)
        query = f"UPDATE animes SET {', '.join(fields)} WHERE id_anime = %s"
        execute_query(query, params, fetch=False)

        return jsonify({'mensagem': 'Anime atualizado com sucesso'}), 200
    except Exception as e:
        print(f"Erro ao editar anime: {e}")
        return jsonify({'erro': 'Erro ao editar anime'}), 500


@animes_bp.route('/<string:anime_id>', methods=['DELETE'])
@jwt_required()
@permission_required('deletar')
def deletar_anime(anime_id):
    """Deletar anime"""
    try:
        query = "DELETE FROM animes WHERE id_anime = %s"
        execute_query(query, (anime_id,), fetch=False)
        return jsonify({'mensagem': 'Anime removido com sucesso'}), 200
    except Exception as e:
        print(f"Erro ao deletar anime: {e}")
        return jsonify({'erro': 'Erro ao deletar anime'}), 500


@animes_bp.route('/<string:anime_id>/atualizacoes', methods=['POST'])
@jwt_required()
@permission_required('criar')
def adicionar_atualizacao_anime(anime_id):
    """Adicionar atualização sobre um anime"""
    if database.mongo_db is None or database.atualizacoes_collection is None or database.notificacoes_collection is None:
        return jsonify({'erro': 'MongoDB não disponível'}), 503

    try:
        data = request.get_json()

        atualizacao = {
            'id_anime': anime_id,
            'tipo_atualizacao': data['tipo'],
            'titulo': data['titulo'],
            'descricao': data.get('descricao'),
            'data_atualizacao': datetime.now(),
            'dados_adicionais': data.get('dados_adicionais', {})
        }

        result = database.atualizacoes_collection.insert_one(atualizacao)

        # Buscar nome do anime
        anime_query = "SELECT titulo_portugues, titulo_original FROM animes WHERE id_anime = %s"
        anime_info = execute_query(anime_query, (anime_id,))
        anime_nome = anime_info[0]['titulo_portugues'] if anime_info and anime_info[0]['titulo_portugues'] else (anime_info[0]['titulo_original'] if anime_info else 'Anime')

        # Criar notificações
        usuarios_query = """
                         SELECT DISTINCT id_usuario
                         FROM lista_usuarios
                         WHERE id_anime = %s
                           AND (status_visualizacao IN ('assistindo', 'planejado') OR favorito = TRUE)
                         """
        usuarios = execute_query(usuarios_query, (anime_id,))

        if usuarios:
            notificacoes = []
            for user in usuarios:
                notificacoes.append({
                    'id_usuario': user['id_usuario'],
                    'id_anime': anime_id,
                    'tipo': data['tipo'],
                    'titulo': data['titulo'],
                    'anime_nome': anime_nome,
                    'mensagem': f"Novidade em anime da sua lista: {anime_nome}",
                    'lida': False,
                    'data_criacao': datetime.now()
                })

            if notificacoes:
                database.notificacoes_collection.insert_many(notificacoes)

        return jsonify({
            'mensagem': 'Atualização adicionada!',
            'notificacoes_enviadas': len(usuarios) if usuarios else 0
        }), 201
    except Exception as e:
        print(f"Erro ao adicionar atualização: {e}")
        return jsonify({'erro': 'Erro ao adicionar atualização'}), 500

