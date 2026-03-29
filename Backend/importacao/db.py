"""
Acesso ao banco para scripts de importação.
"""
from __future__ import annotations

import mysql.connector

from importacao.config import DB_HOST, DB_NAME, DB_PASSWORD, DB_PORT, DB_USER


def get_connection():
    return mysql.connector.connect(
        host=DB_HOST,
        port=DB_PORT,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        charset='utf8mb4',
        use_unicode=True,
    )


def _callproc(cursor, proc_name, params):
    return cursor.callproc(proc_name, params)


def upsert_genero(conn, nome_genero: str, aplicavel_a: str = 'anime,manga,jogo,musica') -> int:
    cursor = conn.cursor()
    cursor.execute("SELECT id_genero FROM generos WHERE nome_genero = %s", (nome_genero,))
    row = cursor.fetchone()
    if row:
        cursor.close()
        return row[0]

    cursor.execute(
        "INSERT INTO generos (nome_genero, descricao, aplicavel_a) VALUES (%s, %s, %s)",
        (nome_genero, None, aplicavel_a),
    )
    conn.commit()
    genero_id = cursor.lastrowid
    cursor.close()
    return genero_id


def inserir_midia_genero(conn, id_midia: str, id_genero: int):
    cursor = conn.cursor()
    cursor.execute(
        "INSERT IGNORE INTO midias_generos (id_midia, id_genero) VALUES (%s, %s)",
        (id_midia, id_genero),
    )
    conn.commit()
    cursor.close()


def inserir_ou_atualizar_anime(conn, dados: dict) -> dict:
    cursor = conn.cursor()
    result = _callproc(
        cursor,
        'inserir_ou_atualizar_anime',
        [
            dados['titulo_original'],
            dados.get('titulo_ingles'),
            dados.get('titulo_portugues'),
            dados.get('sinopse'),
            dados.get('data_lancamento'),
            dados.get('status_anime'),
            dados.get('numero_episodios'),
            dados.get('duracao_episodio'),
            dados.get('classificacao_etaria'),
            dados.get('nota_media'),
            dados.get('poster_url'),
            dados.get('banner_url'),
            dados.get('estudio'),
            dados.get('fonte_original'),
            dados.get('anilist_id'),
            '',
            False,
        ],
    )
    conn.commit()
    cursor.close()
    return {'id_midia': result[15], 'ja_existia': bool(result[16])}


def inserir_ou_atualizar_manga(conn, dados: dict) -> dict:
    cursor = conn.cursor()
    result = _callproc(
        cursor,
        'inserir_ou_atualizar_manga',
        [
            dados['titulo_original'],
            dados.get('titulo_ingles'),
            dados.get('titulo_portugues'),
            dados.get('sinopse'),
            dados.get('data_lancamento'),
            dados.get('nota_media'),
            dados.get('poster_url'),
            dados.get('banner_url'),
            dados.get('status_manga'),
            dados.get('numero_capitulos'),
            dados.get('numero_volumes'),
            dados.get('autor'),
            dados.get('artista'),
            dados.get('publicadora_original'),
            dados.get('revista'),
            dados.get('demografia'),
            dados.get('anilist_id'),
            '',
            False,
        ],
    )
    conn.commit()
    cursor.close()
    return {'id_midia': result[17], 'ja_existia': bool(result[18])}


def inserir_ou_atualizar_jogo(conn, dados: dict) -> dict:
    cursor = conn.cursor()
    result = _callproc(
        cursor,
        'inserir_ou_atualizar_jogo',
        [
            dados['titulo_original'],
            dados.get('titulo_portugues'),
            dados.get('sinopse'),
            dados.get('data_lancamento'),
            dados.get('nota_media'),
            dados.get('poster_url'),
            dados.get('banner_url'),
            dados.get('desenvolvedor'),
            dados.get('publicadora'),
            dados.get('plataformas'),
            dados.get('status_jogo'),
            dados.get('modo_jogo'),
            dados.get('classificacao'),
            dados.get('trailer_url'),
            dados.get('rawg_slug'),
            '',
            False,
        ],
    )
    conn.commit()
    cursor.close()
    return {'id_midia': result[15], 'ja_existia': bool(result[16])}


def inserir_ou_atualizar_musica(conn, dados: dict) -> dict:
    cursor = conn.cursor()
    result = _callproc(
        cursor,
        'inserir_ou_atualizar_musica',
        [
            dados['titulo_original'],
            dados.get('titulo_portugues'),
            dados.get('sinopse'),
            dados.get('data_lancamento'),
            dados.get('poster_url'),
            dados.get('banner_url'),
            dados['artista'],
            dados.get('album'),
            dados.get('tipo_lancamento'),
            dados.get('gravadora'),
            dados.get('duracao_total'),
            dados.get('numero_faixas'),
            dados.get('genero_musical'),
            dados.get('musicbrainz_mbid'),
            '',
            False,
        ],
    )
    conn.commit()
    cursor.close()
    return {'id_midia': result[14], 'ja_existia': bool(result[15])}
