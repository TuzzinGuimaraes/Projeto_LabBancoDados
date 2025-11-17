from pymongo import MongoClient

# Tente conectar
try:
    # Com autenticação
    client = MongoClient('mongodb://admin:senha123@localhost:27017/')

    # Sem autenticação
    # client = MongoClient('mongodb://localhost:27017/')

    # Testar conexão
    client.server_info()
    print("✅ Conexão com MongoDB bem-sucedida!")

    # Listar databases
    print("Databases disponíveis:", client.list_database_names())

    # Criar um teste
    db = client['anime_updates_db']
    collection = db['test']
    collection.insert_one({'teste': 'funcionou!'})
    print("✅ Inserção de teste bem-sucedida!")

    # Limpar teste
    collection.delete_one({'teste': 'funcionou!'})

except Exception as e:
    print(f"❌ Erro ao conectar: {e}")