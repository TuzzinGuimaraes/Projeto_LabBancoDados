"""
Importador de músicas via MusicBrainz + Cover Art Archive.
"""
from __future__ import annotations

import os
import time

import requests

from importacao.config import CAA_BASE_URL, MB_BASE_URL, MB_USER_AGENT
from importacao.db import get_connection, inserir_midia_genero, inserir_ou_atualizar_musica, upsert_genero
from importacao.utils import RateLimiter, formatar_data_parcial, logger

HEADERS = {'User-Agent': MB_USER_AGENT}
RATE_LIMITER = RateLimiter(1.0)


def buscar_artista(nome: str) -> dict | None:
    RATE_LIMITER.wait()
    response = requests.get(
        f'{MB_BASE_URL}/artist',
        headers=HEADERS,
        params={'query': nome, 'fmt': 'json', 'limit': 1},
        timeout=30,
    )
    response.raise_for_status()
    artistas = response.json().get('artists', [])
    return artistas[0] if artistas else None


def buscar_capa_album(release_group_mbid: str) -> str | None:
    try:
        response = requests.get(
            f'{CAA_BASE_URL}/release-group/{release_group_mbid}/front-500',
            headers=HEADERS,
            allow_redirects=True,
            timeout=5,
        )
        if response.status_code == 200:
            return response.url
    except Exception:
        return None
    return None


def processar_e_inserir_musica(release_group: dict, artista_nome: str):
    """Processa um release-group do MusicBrainz e persiste no banco."""
    conn = get_connection()
    try:
        tipo_map = {'Album': 'album', 'EP': 'ep', 'Single': 'single'}
        tipo = tipo_map.get(release_group.get('primary-type', ''), 'album')
        if 'Compilation' in release_group.get('secondary-types', []):
            tipo = 'compilacao'

        genero_musical = None
        tags = release_group.get('tags') or []
        if tags:
            tags = sorted(tags, key=lambda item: item.get('count', 0), reverse=True)
            genero_musical = tags[0].get('name', '').title() or None

        dados = {
            'titulo_original': release_group['title'],
            'titulo_portugues': release_group['title'],
            'sinopse': None,
            'data_lancamento': formatar_data_parcial(release_group.get('first-release-date')),
            'poster_url': buscar_capa_album(release_group['id']),
            'banner_url': None,
            'artista': artista_nome,
            'album': release_group['title'],
            'tipo_lancamento': tipo,
            'gravadora': None,
            'duracao_total': None,
            'numero_faixas': None,
            'genero_musical': genero_musical,
            'musicbrainz_mbid': release_group['id'],
        }

        result = inserir_ou_atualizar_musica(conn, dados)
        for tag in tags[:5]:
            nome_genero = tag.get('name', '').title()
            if not nome_genero:
                continue
            genero_id = upsert_genero(conn, nome_genero, 'musica')
            inserir_midia_genero(conn, result['id_midia'], genero_id)

        logger.info("Música importada: %s - %s", artista_nome, dados['titulo_original'])
        return result
    finally:
        conn.close()


def importar_musicas_por_artista(nome_artista: str):
    """Importa todos os álbuns/release-groups de um artista."""
    artista = buscar_artista(nome_artista)
    if not artista:
        logger.warning('Artista não encontrado: %s', nome_artista)
        return 0

    total = 0
    offset = 0
    while True:
        RATE_LIMITER.wait()
        response = requests.get(
            f'{MB_BASE_URL}/release-group',
            headers=HEADERS,
            params={
                'artist': artista['id'],
                'type': 'album|ep|single',
                'fmt': 'json',
                'limit': 25,
                'offset': offset,
            },
            timeout=30,
        )
        response.raise_for_status()
        data = response.json()
        release_groups = data.get('release-groups', [])

        for release_group in release_groups:
            processar_e_inserir_musica(release_group, artista['name'])
            total += 1
            time.sleep(1)

        if offset + 25 >= data.get('release-group-count', 0):
            break
        offset += 25

    return total


def importar_musicas_por_lista(seed_file: str = 'artistas_seed.txt'):
    """Importa músicas a partir de um arquivo de artistas."""
    caminho_seed = seed_file
    if not os.path.isabs(seed_file):
        caminho_seed = os.path.join(os.path.dirname(__file__), seed_file)

    total = 0
    with open(caminho_seed, 'r', encoding='utf-8') as handle:
        for linha in handle:
            artista = linha.strip()
            if not artista:
                continue
            total += importar_musicas_por_artista(artista)

    logger.info('Importação de músicas concluída. %s registros processados.', total)
    return total
