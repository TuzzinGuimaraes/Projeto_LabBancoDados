"""
Schema de mangá.
"""
from .base import BaseMediaSchema


class MangaSchema(BaseMediaSchema):
    required_fields = {'titulo_original', 'autor'}
    field_types = {
        **BaseMediaSchema.field_types,
        'status_manga': str,
        'numero_capitulos': int,
        'numero_volumes': int,
        'autor': str,
        'artista': str,
        'publicadora_original': str,
        'revista': str,
        'demografia': str,
        'anilist_id': int,
    }
    allowed_values = {
        'status_manga': {'em_publicacao', 'finalizado', 'aguardando', 'cancelado', 'hiato'},
        'demografia': {'shounen', 'shoujo', 'seinen', 'josei', 'kodomomuke'},
    }
    cast_fields = {
        **BaseMediaSchema.cast_fields,
        'numero_capitulos': int,
        'numero_volumes': int,
        'anilist_id': int,
    }
