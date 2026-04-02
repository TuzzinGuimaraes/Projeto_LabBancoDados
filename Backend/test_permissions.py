"""Teste rapido e deterministico da funcao get_user_permissions."""
from __future__ import annotations

import sys

from database import execute_query
from decorators import get_user_permissions


def run_checks() -> dict:
    """Valida contrato basico de permissao com e sem usuarios reais."""
    report = {
        'usuarios_consultados': 0,
        'usuarios_validos': 0,
        'fallback_ok': False,
    }

    usuarios = execute_query("SELECT id_usuario, nome_completo, email FROM usuarios LIMIT 5") or []
    report['usuarios_consultados'] = len(usuarios)

    for usuario in usuarios:
        perms = get_user_permissions(usuario['id_usuario'])
        if perms and perms.get('nivel_acesso') and perms.get('grupos'):
            report['usuarios_validos'] += 1

    perms_fallback = get_user_permissions("USR-FAKE-00000")
    report['fallback_ok'] = bool(
        perms_fallback
        and perms_fallback.get('nivel_acesso') == 'usuario'
        and perms_fallback.get('grupos') == 'Usuários'
    )

    return report


def main() -> int:
    try:
        report = run_checks()
        print("TESTANDO GET_USER_PERMISSIONS")
        print(f"usuarios_consultados={report['usuarios_consultados']}")
        print(f"usuarios_validos={report['usuarios_validos']}")
        print(f"fallback_ok={report['fallback_ok']}")
        if report['usuarios_consultados'] > 0 and report['usuarios_validos'] != report['usuarios_consultados']:
            return 1
        return 0 if report['fallback_ok'] else 1
    except Exception as exc:
        print(f"ERRO_PERMISSIONS={exc}")
        return 1


if __name__ == '__main__':
    sys.exit(main())

