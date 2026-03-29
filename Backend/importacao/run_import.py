"""
Entrypoint dos importadores.
"""
from __future__ import annotations

import argparse

from importacao.importar_animes import importar_animes
from importacao.importar_jogos import importar_jogos
from importacao.importar_mangas import importar_mangas
from importacao.importar_musicas import importar_musicas_por_lista


def main():
    parser = argparse.ArgumentParser(description='Importador de mídias para MediaList DB')
    parser.add_argument('--tipo', choices=['anime', 'manga', 'jogo', 'musica', 'todos'], default='todos')
    parser.add_argument('--paginas', type=int, default=20, help='Número de páginas a importar')
    parser.add_argument('--seed-file', default='artistas_seed.txt', help='Arquivo de artistas para músicas')
    args = parser.parse_args()

    if args.tipo in ('anime', 'todos'):
        print('=== Importando Animes (AniList) ===')
        importar_animes(paginas=args.paginas)

    if args.tipo in ('manga', 'todos'):
        print('=== Importando Mangás (AniList) ===')
        importar_mangas(paginas=args.paginas)

    if args.tipo in ('jogo', 'todos'):
        print('=== Importando Jogos (RAWG) ===')
        importar_jogos(paginas=args.paginas)

    if args.tipo in ('musica', 'todos'):
        print('=== Importando Músicas (MusicBrainz) ===')
        importar_musicas_por_lista(args.seed_file)


if __name__ == '__main__':
    main()
