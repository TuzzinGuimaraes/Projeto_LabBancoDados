"""
Configurações da aplicação
"""
from datetime import timedelta

# Configuração JWT
JWT_SECRET_KEY = 'sua-chave-secreta-super-segura'
JWT_ACCESS_TOKEN_EXPIRES = timedelta(days=1)

# Configuração MySQL
MYSQL_CONFIG = {
    'host': 'localhost',
    'port': 3308,
    'user': 'anime_app_user',
    'password': 'AnimeList@2025!Secure',
    'database': 'anime_list_db',
    'charset': 'utf8mb4',
    'use_unicode': True
}

# Configuração MongoDB
MONGO_URI = 'mongodb://admin:senha123@localhost:27017/'
MONGO_DB_NAME = 'anime_updates_db'

# Token Blocklist
token_blocklist = set()

