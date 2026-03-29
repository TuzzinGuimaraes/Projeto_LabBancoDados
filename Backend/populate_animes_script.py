"""
Compatibilidade para importação de animes.

Uso legado:
    python populate_animes_script.py --limit 100

Agora delega para o importador AniList multimídia.
"""
from __future__ import annotations

import argparse
import math

from importacao.importar_animes import importar_animes


def main():
    parser = argparse.ArgumentParser(description='Importa animes do AniList para o MediaList DB')
    parser.add_argument('--limit', type=int, default=100, help='Quantidade aproximada de animes a processar')
    args = parser.parse_args()

    paginas = max(1, math.ceil(args.limit / 50))
    total = importar_animes(paginas=paginas)
    print(f'Importação concluída. {total} registros processados.')


if __name__ == '__main__':
    main()
