"""
Funções de conexão e operações com bancos de dados
"""
import mysql.connector
from mysql.connector import Error
from pymongo import MongoClient
from config import MYSQL_CONFIG, MONGO_URI, MONGO_DB_NAME

# Variáveis globais para MongoDB
mongo_db = None
noticias_collection = None
atualizacoes_collection = None
notificacoes_collection = None
preferencias_collection = None


def init_mongodb():
    """Inicializar MongoDB"""
    global mongo_db, noticias_collection, atualizacoes_collection, notificacoes_collection, preferencias_collection

    try:
        mongo_client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
        mongo_client.server_info()
        mongo_db = mongo_client[MONGO_DB_NAME]

        noticias_collection = mongo_db['noticias']
        atualizacoes_collection = mongo_db['atualizacoes_animes']
        notificacoes_collection = mongo_db['notificacoes_usuarios']
        preferencias_collection = mongo_db['preferencias_usuarios']

        print("✅ MongoDB conectado com sucesso!")
        return True
    except Exception as e:
        print(f"⚠️  Aviso: MongoDB não conectado - {e}")
        print("   Funcionalidades de notícias/notificações/preferências estarão desabilitadas")
        mongo_db = None
        noticias_collection = None
        atualizacoes_collection = None
        notificacoes_collection = None
        preferencias_collection = None
        return False


def get_db_connection():
    """Cria conexão com MySQL"""
    try:
        connection = mysql.connector.connect(**MYSQL_CONFIG)
        return connection
    except Error as e:
        print(f"Erro ao conectar ao MySQL: {e}")
        return None


def execute_query(query, params=None, fetch=True):
    """Executa query no MySQL"""
    connection = get_db_connection()
    if not connection:
        return None

    try:
        cursor = connection.cursor(dictionary=True)
        cursor.execute(query, params or ())

        if fetch:
            result = cursor.fetchall()
        else:
            connection.commit()
            result = cursor.lastrowid

        cursor.close()
        connection.close()
        return result
    except Error as e:
        print(f"Erro ao executar query: {e}")
        if connection:
            connection.close()
        return None


def call_procedure(proc_name, params=None):
    """Chama procedure no MySQL"""
    connection = get_db_connection()
    if not connection:
        return None

    try:
        cursor = connection.cursor(dictionary=True)

        placeholders = ', '.join(['%s'] * len(params)) if params else ''
        cursor.callproc(proc_name, params or ())

        results = []
        for result in cursor.stored_results():
            results.extend(result.fetchall())

        connection.commit()
        cursor.close()
        connection.close()

        return results
    except Error as e:
        print(f"Erro ao chamar procedure {proc_name}: {e}")
        if connection:
            connection.close()
        return None

