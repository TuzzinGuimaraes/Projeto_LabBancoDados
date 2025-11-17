"""
Blueprints da aplicação
"""
from .auth import auth_bp
from .usuario import usuario_bp
from .animes import animes_bp
from .lista import lista_bp
from .avaliacoes import avaliacoes_bp
from .noticias import noticias_bp
from .moderacao import moderacao_bp
from .preferencias import preferencias_bp
from .utils import utils_bp

__all__ = [
    'auth_bp',
    'usuario_bp',
    'animes_bp',
    'lista_bp',
    'avaliacoes_bp',
    'noticias_bp',
    'moderacao_bp',
    'preferencias_bp',
    'utils_bp'
]

