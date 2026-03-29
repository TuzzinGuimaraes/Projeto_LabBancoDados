"""
Blueprint de músicas.
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from decorators import permission_required
from repositories import MusicaRepository
from schemas import MusicaSchema, ValidationError

musicas_bp = Blueprint('musicas', __name__)

musica_repository = MusicaRepository()
musica_schema = MusicaSchema()


@musicas_bp.route('', methods=['GET'])
def listar_musicas():
    """Listar músicas e álbuns com filtros."""
    try:
        pagina = int(request.args.get('pagina', 1))
        por_pagina = int(request.args.get('por_pagina', 20))
        filtros = {
            'busca': request.args.get('busca'),
            'artista': request.args.get('artista'),
            'tipo_lancamento': request.args.get('tipo_lancamento'),
            'genero_musical': request.args.get('genero_musical'),
            'ordem': request.args.get('ordem', 'nota_media'),
        }
        musicas = musica_repository.buscar_por_tipo('musica', pagina=pagina, limite=por_pagina, filtros=filtros)
        return jsonify({'musicas': musicas, 'midias': musicas, 'pagina': pagina, 'por_pagina': por_pagina}), 200
    except Exception as exc:
        print(f"Erro ao listar músicas: {exc}")
        return jsonify({'erro': 'Erro ao buscar músicas'}), 500


@musicas_bp.route('/<string:musica_id>', methods=['GET'])
def detalhes_musica(musica_id):
    """Detalhes da música/álbum."""
    try:
        musica = musica_repository.buscar_musica_completa(musica_id)
        if not musica:
            return jsonify({'erro': 'Música não encontrada'}), 404
        return jsonify(musica), 200
    except Exception as exc:
        print(f"Erro ao buscar música: {exc}")
        return jsonify({'erro': 'Erro ao buscar detalhes da música'}), 500


@musicas_bp.route('/artista/<string:artista>', methods=['GET'])
def musicas_por_artista(artista):
    """Buscar músicas por artista."""
    try:
        musicas = musica_repository.buscar_por_artista(artista)
        return jsonify({'musicas': musicas}), 200
    except Exception as exc:
        print(f"Erro ao buscar músicas por artista: {exc}")
        return jsonify({'erro': 'Erro ao buscar músicas por artista'}), 500


@musicas_bp.route('', methods=['POST'])
@jwt_required()
@permission_required('criar')
def criar_musica():
    """Criar música."""
    try:
        payload = musica_schema.load(request.get_json() or {})
    except ValidationError as exc:
        return jsonify({'erro': 'Payload inválido', 'detalhes': exc.errors}), 400

    try:
        musica_id = musica_repository.inserir_musica({}, payload)
        return jsonify({'mensagem': 'Música criada com sucesso!', 'id_midia': musica_id}), 201
    except Exception as exc:
        print(f"Erro ao criar música: {exc}")
        return jsonify({'erro': 'Erro ao criar música'}), 500
