"""
Blueprint de mangás.
"""
from flask import Blueprint, jsonify, request
from flask_jwt_extended import jwt_required

from decorators import permission_required
from repositories import MangaRepository
from schemas import MangaSchema, ValidationError

mangas_bp = Blueprint('mangas', __name__)

manga_repository = MangaRepository()
manga_schema = MangaSchema()


@mangas_bp.route('', methods=['GET'])
def listar_mangas():
    """Listar mangás com filtros."""
    try:
        pagina = int(request.args.get('pagina', 1))
        por_pagina = int(request.args.get('por_pagina', 20))
        filtros = {
            'busca': request.args.get('busca'),
            'genero': request.args.get('genero'),
            'status': request.args.get('status'),
            'autor': request.args.get('autor'),
            'demografia': request.args.get('demografia'),
            'ordem': request.args.get('ordem', 'nota_media'),
        }
        mangas = manga_repository.buscar_por_tipo('manga', pagina=pagina, limite=por_pagina, filtros=filtros)
        return jsonify({'mangas': mangas, 'midias': mangas, 'pagina': pagina, 'por_pagina': por_pagina}), 200
    except Exception as exc:
        print(f"Erro ao listar mangás: {exc}")
        return jsonify({'erro': 'Erro ao buscar mangás'}), 500


@mangas_bp.route('/<string:manga_id>', methods=['GET'])
def detalhes_manga(manga_id):
    """Detalhes do mangá."""
    try:
        manga = manga_repository.buscar_manga_completo(manga_id)
        if not manga:
            return jsonify({'erro': 'Mangá não encontrado'}), 404
        return jsonify(manga), 200
    except Exception as exc:
        print(f"Erro ao buscar mangá: {exc}")
        return jsonify({'erro': 'Erro ao buscar detalhes do mangá'}), 500


@mangas_bp.route('/autor/<string:autor>', methods=['GET'])
def mangas_por_autor(autor):
    """Buscar mangás por autor."""
    try:
        mangas = manga_repository.buscar_por_autor(autor)
        return jsonify({'mangas': mangas}), 200
    except Exception as exc:
        print(f"Erro ao buscar mangás por autor: {exc}")
        return jsonify({'erro': 'Erro ao buscar mangás por autor'}), 500


@mangas_bp.route('/demografia/<string:demografia>', methods=['GET'])
def mangas_por_demografia(demografia):
    """Buscar mangás por demografia."""
    try:
        mangas = manga_repository.buscar_por_demografia(demografia)
        return jsonify({'mangas': mangas}), 200
    except Exception as exc:
        print(f"Erro ao buscar mangás por demografia: {exc}")
        return jsonify({'erro': 'Erro ao buscar mangás por demografia'}), 500


@mangas_bp.route('', methods=['POST'])
@jwt_required()
@permission_required('criar')
def criar_manga():
    """Criar mangá."""
    try:
        payload = manga_schema.load(request.get_json() or {})
    except ValidationError as exc:
        return jsonify({'erro': 'Payload inválido', 'detalhes': exc.errors}), 400

    try:
        manga_id = manga_repository.inserir_manga({}, payload)
        return jsonify({'mensagem': 'Mangá criado com sucesso!', 'id_midia': manga_id}), 201
    except Exception as exc:
        print(f"Erro ao criar mangá: {exc}")
        return jsonify({'erro': 'Erro ao criar mangá'}), 500
