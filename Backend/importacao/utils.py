"""
Utilitários compartilhados pelos importadores.
"""
from __future__ import annotations

import logging
import re
import time

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s [%(levelname)s] %(message)s',
    handlers=[
        logging.FileHandler('importacao.log'),
        logging.StreamHandler(),
    ],
)

logger = logging.getLogger(__name__)


class RateLimiter:
    """Garante um intervalo mínimo entre chamadas de API."""

    def __init__(self, min_interval_seconds: float):
        self.min_interval = min_interval_seconds
        self._last_call = 0.0

    def wait(self):
        elapsed = time.time() - self._last_call
        if elapsed < self.min_interval:
            time.sleep(self.min_interval - elapsed)
        self._last_call = time.time()


def remover_html(texto: str | None) -> str | None:
    """Remove tags HTML simples de uma string."""
    if not texto:
        return None
    return re.sub(r'<[^>]+>', '', texto).replace('&quot;', '"').replace('&#039;', "'").strip()


def truncar(texto: str | None, max_len: int) -> str | None:
    if texto and len(texto) > max_len:
        return texto[: max_len - 3] + '...'
    return texto


def formatar_data_parcial(data_raw: str | None) -> str | None:
    """Normaliza datas parciais YYYY ou YYYY-MM."""
    if not data_raw:
        return None

    partes = data_raw.split('-')
    if len(partes) == 1:
        return f'{partes[0]}-01-01'
    if len(partes) == 2:
        return f'{partes[0]}-{partes[1]}-01'
    return data_raw


def formatar_data_anilist(start_date: dict | None) -> str | None:
    """Monta YYYY-MM-DD a partir da estrutura do AniList."""
    if not start_date or not start_date.get('year'):
        return None

    mes = start_date.get('month') or 1
    dia = start_date.get('day') or 1
    return f"{start_date['year']}-{mes:02d}-{dia:02d}"
