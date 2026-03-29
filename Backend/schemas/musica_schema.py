"""
Schema de música.
"""
from .base import BaseMediaSchema


class MusicaSchema(BaseMediaSchema):
    required_fields = {'titulo_original', 'artista'}
    field_types = {
        **BaseMediaSchema.field_types,
        'artista': str,
        'album': str,
        'tipo_lancamento': str,
        'gravadora': str,
        'duracao_total': int,
        'numero_faixas': int,
        'genero_musical': str,
        'musicbrainz_mbid': str,
    }
    allowed_values = {
        'tipo_lancamento': {'album', 'ep', 'single', 'compilacao'},
    }
    cast_fields = {
        **BaseMediaSchema.cast_fields,
        'duracao_total': int,
        'numero_faixas': int,
    }
