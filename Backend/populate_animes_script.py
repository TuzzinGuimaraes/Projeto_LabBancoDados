"""
Script para popular o banco de dados com animes do AniList
Uso: python populate_animes.py [--limit 100] [--update-existing]

Características:
- Busca animes da API do AniList
- Insere no MySQL usando procedure
- Evita duplicatas
- Pode ser executado múltiplas vezes
- Atualiza dados se necessário
"""

import requests
import mysql.connector
from mysql.connector import Error
import time
import argparse
from datetime import datetime

# ============================================
# CONFIGURAÇÃO
# ============================================

MYSQL_CONFIG = {
    'host': 'localhost',
    'port': 3308,
    'user': 'anime_app_user',  # Usuário dedicado (não root)
    'password': 'AnimeList@2025!Secure',  # Senha do usuário da aplicação
    'database': 'anime_list_db',
    'charset': 'utf8mb4',
    'use_unicode': True
}

ANILIST_API_URL = 'https://graphql.anilist.co'

# Mapeamento de gêneros AniList -> Nosso banco
GENRE_MAPPING = {
    'Action': 'Ação',
    'Adventure': 'Aventura',
    'Comedy': 'Comédia',
    'Drama': 'Drama',
    'Ecchi': 'Ecchi',
    'Fantasy': 'Fantasia',
    'Horror': 'Terror',
    'Mahou Shoujo': 'Shoujo',
    'Mecha': 'Mecha',
    'Music': 'Música',
    'Mystery': 'Mistério',
    'Psychological': 'Drama',
    'Romance': 'Romance',
    'Sci-Fi': 'Ficção Científica',
    'Slice of Life': 'Slice of Life',
    'Sports': 'Esportes',
    'Supernatural': 'Sobrenatural',
    'Thriller': 'Mistério'
}

# Status mapping
STATUS_MAPPING = {
    'FINISHED': 'finalizado',
    'RELEASING': 'em_exibicao',
    'NOT_YET_RELEASED': 'aguardando',
    'CANCELLED': 'cancelado'
}

# ============================================
# FUNÇÕES DE BANCO DE DADOS
# ============================================

def get_db_connection():
    """Criar conexão com MySQL"""
    try:
        connection = mysql.connector.connect(**MYSQL_CONFIG)
        return connection
    except Error as e:
        print(f"❌ Erro ao conectar ao MySQL: {e}")
        return None

def execute_query(query, params=None, fetch=True):
    """Executar query"""
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
        print(f"❌ Erro ao executar query: {e}")
        if connection:
            connection.close()
        return None

def obter_generos_disponiveis():
    """Obter mapeamento de gêneros do banco"""
    query = "SELECT id_genero, nome_genero FROM generos"
    result = execute_query(query)

    if result:
        return {g['nome_genero']: g['id_genero'] for g in result}
    return {}

def inserir_anime(anime_data, generos_db, update_existing=True):
    """Inserir ou atualizar anime usando stored procedure"""
    connection = get_db_connection()
    if not connection:
        return None

    try:
        cursor = connection.cursor()

        # Preparar parâmetros para a procedure (14 IN + 2 OUT = 16 params)
        # IMPORTANTE: p_id_anime agora é VARCHAR(50), não INT
        params = [
            anime_data['titulo_original'],      # IN p_titulo_original
            anime_data['titulo_ingles'],        # IN p_titulo_ingles
            anime_data['titulo_portugues'],     # IN p_titulo_portugues
            anime_data['sinopse'],              # IN p_sinopse
            anime_data['data_lancamento'],      # IN p_data_lancamento
            anime_data['status_anime'],         # IN p_status_anime
            anime_data['numero_episodios'],     # IN p_numero_episodios
            anime_data['duracao_episodio'],     # IN p_duracao_episodio
            anime_data['classificacao_etaria'], # IN p_classificacao_etaria
            anime_data['nota_media'],           # IN p_nota_media
            anime_data['poster_url'],           # IN p_poster_url
            anime_data['banner_url'],           # IN p_banner_url
            anime_data['estudio'],              # IN p_estudio
            anime_data['fonte_original'],       # IN p_fonte_original
            '',                                 # OUT p_id_anime VARCHAR(50) - placeholder
            False                               # OUT p_ja_existia BOOLEAN - placeholder
        ]

        # Chamar a stored procedure
        result = cursor.callproc('inserir_ou_atualizar_anime', params)

        # Os valores OUT estão nos índices 14 e 15 do resultado
        anime_id = result[14]  # p_id_anime VARCHAR(50) - Ex: 'ANM-IMP-2025-00001'
        existed = bool(result[15])  # p_ja_existia BOOLEAN

        connection.commit()

        # Inserir gêneros
        if anime_id and anime_data['generos']:
            # Limpar gêneros existentes se estiver atualizando
            if existed and update_existing:
                cursor.execute("DELETE FROM animes_generos WHERE id_anime = %s", (anime_id,))

            # Inserir novos gêneros
            for genero in anime_data['generos']:
                genero_nome = GENRE_MAPPING.get(genero, genero)
                if genero_nome in generos_db:
                    try:
                        cursor.execute(
                            "INSERT IGNORE INTO animes_generos (id_anime, id_genero) VALUES (%s, %s)",
                            (anime_id, generos_db[genero_nome])
                        )
                    except:
                        pass

            connection.commit()

        cursor.close()
        connection.close()

        return {
            'id': anime_id,
            'existed': existed
        }

    except Error as e:
        print(f"❌ Erro ao inserir anime: {e}")
        if connection:
            connection.close()
        return None

# ============================================
# FUNÇÕES DA API ANILIST
# ============================================

def buscar_animes_anilist(page=1, per_page=50):
    """Buscar animes da API do AniList"""

    query = '''
    query ($page: Int, $perPage: Int) {
        Page(page: $page, perPage: $perPage) {
            pageInfo {
                total
                currentPage
                lastPage
                hasNextPage
            }
            media(type: ANIME, sort: POPULARITY_DESC) {
                id
                title {
                    romaji
                    english
                    native
                }
                description
                startDate {
                    year
                    month
                    day
                }
                episodes
                duration
                averageScore
                coverImage {
                    large
                    extraLarge
                }
                bannerImage
                genres
                status
                studios {
                    nodes {
                        name
                    }
                }
                source
                isAdult
            }
        }
    }
    '''

    variables = {
        'page': page,
        'perPage': per_page
    }

    try:
        response = requests.post(
            ANILIST_API_URL,
            json={'query': query, 'variables': variables},
            timeout=30
        )

        if response.status_code == 200:
            return response.json()
        elif response.status_code == 429:
            print("⚠️  Rate limit atingido, aguardando 60 segundos...")
            time.sleep(60)
            return buscar_animes_anilist(page, per_page)
        else:
            print(f"❌ Erro na API: {response.status_code}")
            return None

    except Exception as e:
        print(f"❌ Erro ao buscar da API: {e}")
        return None

def processar_anime_anilist(anime_data):
    """Processar dados do anime do AniList para nosso formato"""

    # Título
    titulo_original = anime_data['title']['romaji'] or anime_data['title']['native']
    titulo_ingles = anime_data['title']['english']

    # Data de lançamento
    data_lancamento = None
    if anime_data['startDate']['year']:
        try:
            year = anime_data['startDate']['year']
            month = anime_data['startDate']['month'] or 1
            day = anime_data['startDate']['day'] or 1
            data_lancamento = f"{year}-{month:02d}-{day:02d}"
        except:
            pass

    # Status
    status = STATUS_MAPPING.get(anime_data['status'], 'aguardando')

    # Nota (AniList usa escala de 0-100, converter para 0-10)
    nota_media = None
    if anime_data['averageScore']:
        nota_media = round(anime_data['averageScore'] / 10, 2)

    # Estúdio
    estudio = None
    if anime_data['studios']['nodes']:
        estudio = anime_data['studios']['nodes'][0]['name']

    # Fonte original
    fonte_mapping = {
        'MANGA': 'Manga',
        'LIGHT_NOVEL': 'Light Novel',
        'VISUAL_NOVEL': 'Visual Novel',
        'VIDEO_GAME': 'Video Game',
        'OTHER': 'Outro',
        'NOVEL': 'Novel',
        'DOUJINSHI': 'Doujinshi',
        'ANIME': 'Anime',
        'ORIGINAL': 'Original'
    }
    fonte_original = fonte_mapping.get(anime_data['source'], 'Desconhecido')

    # Classificação etária
    classificacao = '18' if anime_data['isAdult'] else '14'

    # Sinopse (remover HTML tags)
    sinopse = anime_data['description']
    if sinopse:
        import re
        sinopse = re.sub('<[^<]+?>', '', sinopse)  # Remove HTML tags
        sinopse = sinopse.replace('<br>', '\n')
        if len(sinopse) > 1000:
            sinopse = sinopse[:997] + '...'

    return {
        'titulo_original': titulo_original,
        'titulo_ingles': titulo_ingles,
        'titulo_portugues': titulo_ingles,  # Usar inglês como padrão para português
        'sinopse': sinopse,
        'data_lancamento': data_lancamento,
        'status_anime': status,
        'numero_episodios': anime_data['episodes'],
        'duracao_episodio': anime_data['duration'],
        'classificacao_etaria': classificacao,
        'nota_media': nota_media,
        'poster_url': anime_data['coverImage']['extraLarge'] or anime_data['coverImage']['large'],
        'banner_url': anime_data['bannerImage'],
        'estudio': estudio,
        'fonte_original': fonte_original,
        'generos': anime_data['genres'] or []
    }

# ============================================
# FUNÇÃO PRINCIPAL
# ============================================

def popular_banco(limit=100, update_existing=True):
    """Função principal para popular o banco"""

    print("=" * 70)
    print("🎌 POPULAR BANCO DE DADOS COM ANIMES DO ANILIST")
    print("=" * 70)

    # Verificar conexão
    print("\n1️⃣ Verificando conexão com MySQL...")
    conn = get_db_connection()
    if not conn:
        print("❌ Não foi possível conectar ao MySQL")
        return
    conn.close()
    print("✅ Conexão OK")

    # Verificar se a procedure existe
    print("\n2️⃣ Verificando stored procedure...")
    check_proc = execute_query(
        "SELECT COUNT(*) as count FROM information_schema.ROUTINES WHERE ROUTINE_SCHEMA = 'anime_list_db' AND ROUTINE_NAME = 'inserir_ou_atualizar_anime'"
    )

    if check_proc and check_proc[0]['count'] > 0:
        print("✅ Stored procedure 'inserir_ou_atualizar_anime' encontrada")
    else:
        print("⚠️ AVISO: Stored procedure 'inserir_ou_atualizar_anime' não encontrada!")
        print("   Certifique-se de que o schema MySQL foi executado corretamente.")
        print("   O script continuará, mas pode falhar ao inserir animes.")

    # Obter gêneros
    print("\n3️⃣ Carregando gêneros do banco...")
    generos_db = obter_generos_disponiveis()
    print(f"✅ {len(generos_db)} gêneros carregados")
    
    # Buscar animes
    print(f"\n4️⃣ Buscando animes do AniList (limite: {limit})...")

    per_page = 50
    total_pages = (limit // per_page) + (1 if limit % per_page > 0 else 0)
    
    inseridos = 0
    atualizados = 0
    erros = 0
    
    for page in range(1, total_pages + 1):
        print(f"\n📄 Página {page}/{total_pages}")
        
        # Buscar dados
        response = buscar_animes_anilist(page, per_page)
        
        if not response or 'data' not in response:
            print("❌ Erro ao buscar página")
            continue
        
        animes = response['data']['Page']['media']
        
        for anime_raw in animes:
            if inseridos + atualizados >= limit:
                break
            
            try:
                # Processar anime
                anime_data = processar_anime_anilist(anime_raw)
                
                # Inserir no banco
                result = inserir_anime(anime_data, generos_db, update_existing)
                
                if result:
                    if result['existed']:
                        atualizados += 1
                        print(f"   🔄 Atualizado: {anime_data['titulo_original']}")
                    else:
                        inseridos += 1
                        print(f"   ✅ Inserido: {anime_data['titulo_original']}")
                else:
                    erros += 1
                    print(f"   ❌ Erro: {anime_data['titulo_original']}")
                
            except Exception as e:
                erros += 1
                print(f"   ❌ Erro ao processar anime: {e}")
        
        if inseridos + atualizados >= limit:
            break
        
        # Rate limiting - API do AniList permite ~90 requisições por minuto
        time.sleep(1)
    
    # Resumo
    print("\n" + "=" * 70)
    print("📊 RESUMO DA IMPORTAÇÃO")
    print("=" * 70)
    print(f"✅ Animes inseridos:   {inseridos}")
    print(f"🔄 Animes atualizados: {atualizados}")
    print(f"❌ Erros:              {erros}")
    print(f"📝 Total processado:   {inseridos + atualizados + erros}")
    print("=" * 70)
    
    # Verificar total no banco
    total_query = "SELECT COUNT(*) as total FROM animes"
    result = execute_query(total_query)
    if result:
        print(f"\n🎯 Total de animes no banco: {result[0]['total']}")
    
    print("\n✅ Importação concluída!")

# ============================================
# SCRIPT PRINCIPAL
# ============================================

if __name__ == '__main__':
    parser = argparse.ArgumentParser(description='Popular banco de dados com animes do AniList')
    parser.add_argument('--limit', type=int, default=100, help='Número máximo de animes para importar (padrão: 100)')
    parser.add_argument('--update-existing', action='store_true', help='Atualizar animes que já existem no banco')
    parser.add_argument('--no-update', action='store_true', help='Não atualizar animes existentes, apenas inserir novos')
    
    args = parser.parse_args()
    
    update_existing = not args.no_update
    
    try:
        popular_banco(limit=args.limit, update_existing=update_existing)
    except KeyboardInterrupt:
        print("\n\n⚠️  Importação interrompida pelo usuário")
    except Exception as e:
        print(f"\n\n❌ Erro inesperado: {e}")
        import traceback
        traceback.print_exc()