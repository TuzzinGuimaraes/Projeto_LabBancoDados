"""
Importador de mangás via AniList.
"""
from __future__ import annotations

from importacao.anilist import importar_do_anilist
from importacao.db import get_connection, inserir_midia_genero, inserir_ou_atualizar_manga, upsert_genero
from importacao.utils import formatar_data_anilist, logger, remover_html, truncar

GENERO_MAP = {
    'Action': 'Ação',
    'Adventure': 'Aventura',
    'Comedy': 'Comédia',
    'Drama': 'Drama',
    'Fantasy': 'Fantasia',
    'Sci-Fi': 'Ficção Científica',
    'Romance': 'Romance',
    'Slice of Life': 'Slice of Life',
    'Supernatural': 'Sobrenatural',
    'Mystery': 'Mistério',
    'Horror': 'Terror',
    'Sports': 'Esportes',
}

STATUS_MAP = {
    'RELEASING': 'em_publicacao',
    'FINISHED': 'finalizado',
    'NOT_YET_RELEASED': 'aguardando',
    'CANCELLED': 'cancelado',
    'HIATUS': 'hiato',
}

DEMOGRAFIA_MAP = {
    'Shounen': 'shounen',
    'Shoujo': 'shoujo',
    'Seinen': 'seinen',
    'Josei': 'josei',
}


def _extrair_autoria(staff: dict | None) -> tuple[str | None, str | None]:
    autor = None
    artista = None

    for edge in (staff or {}).get('edges', []):
        role = edge.get('role', '')
        nome = edge.get('node', {}).get('name', {}).get('full')
        if not nome:
            continue
        if 'Story & Art' in role:
            return nome, nome
        if 'Story' in role and not autor:
            autor = nome
        if 'Art' in role and not artista:
            artista = nome

    return autor, artista or autor


def processar_e_inserir_manga(manga: dict):
    """Processa um item do AniList e persiste no banco."""
    conn = get_connection()
    try:
        autor, artista = _extrair_autoria(manga.get('staff'))
        demografia = None
        generos = []

        for genero in manga.get('genres', []):
            if genero in DEMOGRAFIA_MAP and not demografia:
                demografia = DEMOGRAFIA_MAP[genero]
            else:
                generos.append(GENERO_MAP.get(genero, genero))

        dados = {
            'titulo_original': manga['title'].get('native') or manga['title'].get('romaji'),
            'titulo_ingles': manga['title'].get('english'),
            'titulo_portugues': manga['title'].get('romaji') or manga['title'].get('english'),
            'sinopse': truncar(remover_html(manga.get('description')), 1000),
            'data_lancamento': formatar_data_anilist(manga.get('startDate')),
            'nota_media': round((manga.get('meanScore') or 0) / 10, 2) if manga.get('meanScore') else None,
            'poster_url': manga.get('coverImage', {}).get('large'),
            'banner_url': manga.get('bannerImage'),
            'status_manga': STATUS_MAP.get(manga.get('status'), 'aguardando'),
            'numero_capitulos': manga.get('chapters'),
            'numero_volumes': manga.get('volumes'),
            'autor': autor,
            'artista': artista,
            'demografia': demografia,
            'anilist_id': manga.get('id'),
        }

        result = inserir_ou_atualizar_manga(conn, dados)
        for genero in generos:
            genero_id = upsert_genero(conn, genero, 'anime,manga,jogo')
            inserir_midia_genero(conn, result['id_midia'], genero_id)

        logger.info("Mangá importado: %s (%s)", dados['titulo_original'], result['id_midia'])
        return result
    finally:
        conn.close()


def importar_mangas(paginas: int = 20):
    """Executa a importação em lote de mangás."""
    total = 0
    for item in importar_do_anilist('MANGA', paginas):
        processar_e_inserir_manga(item)
        total += 1
    logger.info('Importação de mangás concluída. %s registros processados.', total)
    return total
