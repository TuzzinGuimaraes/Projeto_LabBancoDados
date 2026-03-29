"""
Importador de jogos via RAWG.
"""
from __future__ import annotations

import time

import requests

from importacao.config import RAWG_API_KEY, RAWG_BASE_URL
from importacao.db import get_connection, inserir_midia_genero, inserir_ou_atualizar_jogo, upsert_genero
from importacao.utils import logger, truncar

PLATAFORMAS_MAP = {
    'PC': 'PC',
    'PlayStation 4': 'PS4',
    'PlayStation 5': 'PS5',
    'Xbox One': 'Xbox One',
    'Xbox Series S/X': 'Xbox Series',
    'Nintendo Switch': 'Switch',
    'iOS': 'iOS',
    'Android': 'Android',
}

GENERO_MAP = {
    'Role-Playing Games (RPG)': 'RPG',
    'RPG': 'RPG',
    'Shooter': 'FPS',
    'Strategy': 'Estratégia',
    'Platformer': 'Plataforma',
    'Battle Royale': 'Battle Royale',
    'Simulation': 'Simulação',
    'Puzzle': 'Puzzle',
    'Survival': 'Survival',
    'MOBA': 'MOBA',
    'Action': 'Ação',
    'Adventure': 'Aventura',
}


def normalizar_plataformas(plataformas_rawg: list) -> str:
    nomes = [PLATAFORMAS_MAP.get(p['platform']['name'], p['platform']['name']) for p in plataformas_rawg]
    return ', '.join(nomes[:6])


def buscar_detalhe_jogo(slug: str) -> dict | None:
    if not RAWG_API_KEY:
        raise RuntimeError('RAWG_API_KEY não configurada')

    response = requests.get(
        f'{RAWG_BASE_URL}/games/{slug}',
        params={'key': RAWG_API_KEY},
        timeout=30,
    )
    if response.status_code == 200:
        return response.json()
    logger.warning('Falha ao buscar detalhe do jogo %s: %s', slug, response.status_code)
    return None


def processar_e_inserir_jogo(basico: dict, detalhe: dict):
    """Processa um jogo do RAWG e persiste no banco."""
    conn = get_connection()
    try:
        tags = [tag['name'].lower().replace('-', '').replace(' ', '') for tag in detalhe.get('tags', [])]
        if 'singleplayer' in tags and 'multiplayer' in tags:
            modo_jogo = 'ambos'
        elif 'multiplayer' in tags:
            modo_jogo = 'multi'
        else:
            modo_jogo = 'single'

        esrb = (basico.get('esrb_rating') or {}).get('name')
        dados = {
            'titulo_original': basico['name'],
            'titulo_portugues': basico.get('name'),
            'sinopse': truncar(detalhe.get('description_raw'), 1000),
            'data_lancamento': basico.get('released'),
            'nota_media': round((basico.get('rating') or 0) * 2, 2) if basico.get('rating') else None,
            'poster_url': basico.get('background_image'),
            'desenvolvedor': (detalhe.get('developers') or [{}])[0].get('name'),
            'publicadora': (detalhe.get('publishers') or [{}])[0].get('name'),
            'plataformas': normalizar_plataformas(basico.get('platforms', [])),
            'status_jogo': 'lancado' if basico.get('released') else 'em_desenvolvimento',
            'modo_jogo': modo_jogo,
            'classificacao': f'ESRB: {esrb}' if esrb else None,
            'rawg_slug': basico.get('slug'),
            'trailer_url': None,
        }

        result = inserir_ou_atualizar_jogo(conn, dados)
        for genero in basico.get('genres', []):
            nome_genero = GENERO_MAP.get(genero['name'], genero['name'])
            genero_id = upsert_genero(conn, nome_genero, 'jogo')
            inserir_midia_genero(conn, result['id_midia'], genero_id)

        logger.info("Jogo importado: %s (%s)", dados['titulo_original'], result['id_midia'])
        return result
    finally:
        conn.close()


def importar_jogos(paginas: int = 25):
    """Executa a importação em lote de jogos."""
    if not RAWG_API_KEY:
        raise RuntimeError('RAWG_API_KEY não configurada')

    total = 0
    for pagina in range(1, paginas + 1):
        response = requests.get(
            f'{RAWG_BASE_URL}/games',
            params={
                'key': RAWG_API_KEY,
                'ordering': '-rating',
                'page': pagina,
                'page_size': 40,
                'metacritic': '60,100',
            },
            timeout=30,
        )
        response.raise_for_status()
        data = response.json()
        for jogo_basico in data.get('results', []):
            detalhe = buscar_detalhe_jogo(jogo_basico['slug'])
            if detalhe:
                processar_e_inserir_jogo(jogo_basico, detalhe)
                total += 1
            time.sleep(1)

        if not data.get('next'):
            break
        time.sleep(2)

    logger.info('Importação de jogos concluída. %s registros processados.', total)
    return total
