"""
Decoradores para verificação de permissões
"""
from functools import wraps
from flask import jsonify
from flask_jwt_extended import get_jwt_identity
from database import execute_query


def get_user_permissions(user_id):
    """Obter permissões do usuário"""
    query = """
        SELECT MAX(gu.nivel_acesso) as nivel_acesso,
               GROUP_CONCAT(DISTINCT gu.nome_grupo SEPARATOR ', ') as grupos,
               MAX(CASE WHEN gu.pode_criar = TRUE THEN 1 ELSE 0 END) as pode_criar,
               MAX(CASE WHEN gu.pode_editar = TRUE THEN 1 ELSE 0 END) as pode_editar,
               MAX(CASE WHEN gu.pode_deletar = TRUE THEN 1 ELSE 0 END) as pode_deletar,
               MAX(CASE WHEN gu.pode_moderar = TRUE THEN 1 ELSE 0 END) as pode_moderar
        FROM usuarios u
                 LEFT JOIN usuarios_grupos ug ON u.id_usuario = ug.id_usuario
                 LEFT JOIN grupos_usuarios gu ON ug.id_grupo = gu.id_grupo
        WHERE u.id_usuario = %s
        GROUP BY u.id_usuario
    """
    result = execute_query(query, (user_id,))

    # Se não encontrar permissões (usuário sem grupo), retornar padrão
    if not result or not result[0]['nivel_acesso']:
        return {
            'nivel_acesso': 'usuario',
            'grupos': 'Usuários',
            'pode_criar': 1,
            'pode_editar': 1,
            'pode_deletar': 0,
            'pode_moderar': 0
        }

    return result[0]


def permission_required(permission_name):
    """Decorator para verificar permissões específicas"""
    def decorator(f):
        @wraps(f)
        def decorated_function(*args, **kwargs):
            user_id = get_jwt_identity()
            permissions = get_user_permissions(user_id)

            if not permissions:
                return jsonify({'erro': 'Usuário não encontrado'}), 404

            # Admin tem todas as permissões
            if permissions.get('nivel_acesso') == 'admin':
                return f(*args, **kwargs)

            # Verifica permissão específica
            permission_map = {
                'criar': 'pode_criar',
                'editar': 'pode_editar',
                'deletar': 'pode_deletar',
                'moderar': 'pode_moderar'
            }

            if permission_name in permission_map:
                if not permissions.get(permission_map[permission_name]):
                    return jsonify({'erro': f'Sem permissão para {permission_name}'}), 403

            return f(*args, **kwargs)
        return decorated_function
    return decorator


def moderator_or_admin_required(f):
    """Decorator para verificar se é moderador ou admin"""
    @wraps(f)
    def decorated_function(*args, **kwargs):
        user_id = get_jwt_identity()
        permissions = get_user_permissions(user_id)

        if not permissions:
            return jsonify({'erro': 'Usuário não encontrado'}), 404

        if permissions.get('nivel_acesso') == 'admin' or permissions.get('pode_moderar'):
            return f(*args, **kwargs)

        return jsonify({'erro': 'Acesso restrito a moderadores e administradores'}), 403

    return decorated_function

