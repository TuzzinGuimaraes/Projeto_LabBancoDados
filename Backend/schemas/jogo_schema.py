"""
Schema de jogo.
"""
from .base import BaseMediaSchema


class JogoSchema(BaseMediaSchema):
    required_fields = {'titulo_original'}
    field_types = {
        **BaseMediaSchema.field_types,
        'desenvolvedor': str,
        'publicadora': str,
        'plataformas': str,
        'status_jogo': str,
        'modo_jogo': str,
        'classificacao': str,
        'trailer_url': str,
        'rawg_slug': str,
    }
    allowed_values = {
        'status_jogo': {'lancado', 'em_desenvolvimento', 'cancelado', 'remasterizado'},
        'modo_jogo': {'single', 'multi', 'ambos'},
    }
