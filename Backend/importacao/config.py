"""
Configuração dos scripts de importação.
"""
import os

from dotenv import load_dotenv

load_dotenv()

DB_HOST = os.getenv('DB_HOST', 'localhost')
DB_PORT = int(os.getenv('DB_PORT', '3308'))
DB_NAME = os.getenv('DB_NAME', 'medialist_db')
DB_USER = os.getenv('DB_USER', 'media_app_user')
DB_PASSWORD = os.getenv('DB_PASSWORD', 'MediaList@2025!Secure')

ANILIST_URL = os.getenv('ANILIST_API_URL', 'https://graphql.anilist.co')
RAWG_API_KEY = os.getenv('RAWG_API_KEY', '')
RAWG_BASE_URL = os.getenv('RAWG_API_URL', 'https://api.rawg.io/api')
MB_BASE_URL = os.getenv('MB_API_URL', 'https://musicbrainz.org/ws/2')
CAA_BASE_URL = os.getenv('CAA_API_URL', 'https://coverartarchive.org')
MB_USER_AGENT = os.getenv('MB_USER_AGENT', 'MediaListApp/1.0 (dev@exemplo.com)')
