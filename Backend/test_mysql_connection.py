"""
Script de teste de conexão com MySQL
"""
from database import execute_query, get_db_connection

print("=" * 60)
print("🔍 TESTANDO CONEXÃO COM MYSQL")
print("=" * 60)

# Teste 1: Conexão básica
print("\n1️⃣ Testando conexão básica...")
try:
    conn = get_db_connection()
    if conn:
        print("✅ Conexão estabelecida com sucesso!")
        conn.close()
    else:
        print("❌ Falha ao conectar")
except Exception as e:
    print(f"❌ Erro: {e}")

# Teste 2: Query simples
print("\n2️⃣ Testando query simples...")
try:
    result = execute_query("SELECT 1 as test")
    if result:
        print(f"✅ Query executada: {result}")
    else:
        print("❌ Query retornou None")
except Exception as e:
    print(f"❌ Erro: {e}")

# Teste 3: Verificar tabelas
print("\n3️⃣ Verificando tabelas do banco...")
try:
    result = execute_query("SHOW TABLES")
    if result:
        print(f"✅ Encontradas {len(result)} tabelas:")
        for table in result[:10]:  # Mostrar primeiras 10
            print(f"   - {list(table.values())[0]}")
        if len(result) > 10:
            print(f"   ... e mais {len(result) - 10} tabelas")
    else:
        print("❌ Nenhuma tabela encontrada")
except Exception as e:
    print(f"❌ Erro: {e}")

# Teste 4: Verificar tabela grupos_usuarios
print("\n4️⃣ Verificando tabela grupos_usuarios...")
try:
    result = execute_query("SELECT * FROM grupos_usuarios")
    if result:
        print(f"✅ Tabela existe com {len(result)} grupos:")
        for grupo in result:
            print(f"   - {grupo['nome_grupo']} ({grupo['nivel_acesso']})")
    else:
        print("⚠️ Tabela vazia")
except Exception as e:
    print(f"❌ Erro: {e}")

# Teste 5: Verificar tabela usuarios
print("\n5️⃣ Verificando tabela usuarios...")
try:
    result = execute_query("SELECT COUNT(*) as total FROM usuarios")
    if result:
        print(f"✅ Tabela existe com {result[0]['total']} usuários")
    else:
        print("⚠️ Tabela vazia")
except Exception as e:
    print(f"❌ Erro: {e}")

print("\n" + "=" * 60)
print("🏁 TESTE CONCLUÍDO")
print("=" * 60)

