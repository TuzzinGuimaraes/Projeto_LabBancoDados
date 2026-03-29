"""
Exports dos repositórios.
"""
from .midia_repository import (
    AnimeRepository,
    JogoRepository,
    ListaRepository,
    MangaRepository,
    MidiaRepository,
    MusicaRepository,
)

__all__ = [
    'MidiaRepository',
    'AnimeRepository',
    'MangaRepository',
    'JogoRepository',
    'MusicaRepository',
    'ListaRepository',
]
