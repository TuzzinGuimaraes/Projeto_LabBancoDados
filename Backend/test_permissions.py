"""
Teste rápido da função get_user_permissions após correção
"""
from decorators import get_user_permissions
from database import execute_query

print("=" * 60)
print("🧪 TESTANDO GET_USER_PERMISSIONS")
print("=" * 60)

# Listar usuários existentes
print("\n📋 Buscando usuários no banco...")
try:
    usuarios = execute_query("SELECT id_usuario, nome_completo, email FROM usuarios LIMIT 5")
    if usuarios:
        print(f"✅ Encontrados {len(usuarios)} usuário(s):")
        for u in usuarios:
            print(f"   - {u['nome_completo']} ({u['id_usuario']})")

            # Testar get_user_permissions para este usuário
            print(f"     Testando permissões...")
            perms = get_user_permissions(u['id_usuario'])
            if perms:
                print(f"     ✅ Nível: {perms.get('nivel_acesso')}, Grupos: {perms.get('grupos')}")
                print(f"     ✅ Criar: {perms.get('pode_criar')}, Editar: {perms.get('pode_editar')}")
            else:
                print(f"     ❌ Permissões retornaram None")
    else:
        print("⚠️  Nenhum usuário encontrado no banco")
        print("   Tente criar um usuário primeiro via registro")
except Exception as e:
    print(f"❌ Erro: {e}")

# Testar com usuário inexistente (deve retornar padrão)
print("\n🔍 Testando com usuário inexistente...")
try:
    perms = get_user_permissions("USR-FAKE-00000")
    if perms:
        print(f"✅ Retornou permissões padrão:")
        print(f"   Nível: {perms.get('nivel_acesso')}")
        print(f"   Grupos: {perms.get('grupos')}")
    else:
        print("❌ Retornou None (não deveria)")
except Exception as e:
    print(f"❌ Erro: {e}")

print("\n" + "=" * 60)
print("✅ TESTE CONCLUÍDO")
print("=" * 60)

