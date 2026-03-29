"""
Schema de anime.
"""
from .base import BaseMediaSchema


class AnimeSchema(BaseMediaSchema):
    required_fields = {'titulo_original'}
    field_types = {
        **BaseMediaSchema.field_types,
        'status_anime': str,
        'numero_episodios': int,
        'duracao_episodio': int,
        'classificacao_etaria': str,
        'trailer_url': str,
        'estudio': str,
        'fonte_original': str,
        'anilist_id': int,
    }
    allowed_values = {
        'status_anime': {'em_exibicao', 'finalizado', 'aguardando', 'cancelado'},
    }
    cast_fields = {
        **BaseMediaSchema.cast_fields,
        'numero_episodios': int,
        'duracao_episodio': int,
        'anilist_id': int,
    }
