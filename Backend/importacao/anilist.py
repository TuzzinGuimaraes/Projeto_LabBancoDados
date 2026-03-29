"""
Cliente AniList reutilizável para animes e mangás.
"""
from __future__ import annotations

import time

import requests

from importacao.config import ANILIST_URL
from importacao.utils import logger

QUERY_ANILIST = """
query ($page: Int, $perPage: Int, $tipo: MediaType) {
  Page(page: $page, perPage: $perPage) {
    pageInfo {
      total
      currentPage
      lastPage
      hasNextPage
      perPage
    }
    media(type: $tipo, sort: POPULARITY_DESC) {
      id
      title {
        romaji
        english
        native
      }
      description(asHtml: false)
      startDate { year month day }
      status
      episodes
      duration
      chapters
      volumes
      coverImage { large extraLarge }
      bannerImage
      meanScore
      genres
      studios(isMain: true) { nodes { name } }
      staff(sort: RELEVANCE) {
        edges {
          role
          node { name { full } }
        }
      }
      source
      trailer { id site }
      isAdult
    }
  }
}
"""


def importar_do_anilist(tipo: str, paginas: int = 20):
    """
    Retorna um gerador com itens do AniList.

    tipo: ANIME ou MANGA
    """
    pagina = 1
    while pagina <= paginas:
        payload = {
            'query': QUERY_ANILIST,
            'variables': {'page': pagina, 'perPage': 50, 'tipo': tipo},
        }
        response = requests.post(ANILIST_URL, json=payload, timeout=30)

        if response.status_code == 429:
            retry_after = int(response.headers.get('Retry-After', 60))
            logger.warning('Rate limit do AniList atingido. Aguardando %ss.', retry_after)
            time.sleep(retry_after)
            continue

        response.raise_for_status()
        data = response.json()['data']['Page']
        for item in data['media']:
            yield item

        if not data['pageInfo']['hasNextPage']:
            break

        pagina += 1
        time.sleep(0.7)
