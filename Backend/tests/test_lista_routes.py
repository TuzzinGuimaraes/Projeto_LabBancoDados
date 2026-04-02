from routes import lista as lista_routes


def test_get_lista_retorna_apenas_itens_do_usuario(client, auth_headers, monkeypatch):
    chamadas = []

    def fake_obter_lista(user_id, tipo=None, status=None):
        chamadas.append((user_id, tipo, status))
        return [{'id_lista': 'LST-1', 'tipo': 'anime'}]

    monkeypatch.setattr(lista_routes.lista_repository, 'obter_lista_usuario', fake_obter_lista)

    response = client.get('/api/lista?tipo=anime&status=assistindo', headers=auth_headers)

    assert response.status_code == 200
    assert response.get_json()['lista'][0]['id_lista'] == 'LST-1'
    assert chamadas == [('USR-TEST-0001', 'anime', 'assistindo')]


def test_get_lista_por_id_nega_outro_usuario(client, auth_headers):
    response = client.get('/api/lista/USR-OUTRO-1', headers=auth_headers)

    assert response.status_code == 403
    assert response.get_json()['erro'] == 'Sem permissão para acessar esta lista'


def test_post_lista_adicionar_com_payload_enriquecido(client, auth_headers, monkeypatch):
    monkeypatch.setattr(lista_routes.midia_repository, 'buscar_por_id', lambda _id: {'id_midia': 'MID-1'})
    monkeypatch.setattr(lista_routes.lista_repository, 'adicionar_midia', lambda *_args: [{'mensagem': 'Mídia adicionada à lista!'}])
    monkeypatch.setattr(lista_routes.lista_repository, 'obter_item_usuario', lambda *_args: {'id_lista': 'LST-10'})

    progresso = []
    atualizacoes = []
    monkeypatch.setattr(lista_routes.lista_repository, 'atualizar_progresso', lambda *args: progresso.append(args))
    monkeypatch.setattr(lista_routes.lista_repository, 'atualizar_item', lambda lista_id, payload: atualizacoes.append((lista_id, payload)))

    response = client.post('/api/lista/adicionar', headers=auth_headers, json={
        'id_midia': 'MID-1',
        'status': 'assistindo',
        'nota_usuario': 9.5,
        'progresso_atual': 12,
        'favorito': True,
        'data_inicio': '2026-04-01',
        'data_conclusao': '2026-04-10',
        'comentario': 'otimo',
        'total_rewatches': 2,
        'privado': True,
    })

    assert response.status_code == 201
    assert progresso == [('LST-10', 12, 'assistindo')]
    assert atualizacoes == [(
        'LST-10',
        {
            'nota_usuario': 9.5,
            'favorito': True,
            'comentario': 'otimo',
            'data_inicio': '2026-04-01',
            'data_conclusao': '2026-04-10',
            'total_rewatches': 2,
            'privado': True,
        },
    )]


def test_post_lista_adicionar_aceita_aliases_legados(client, auth_headers, monkeypatch):
    monkeypatch.setattr(lista_routes.midia_repository, 'buscar_por_id', lambda _id: {'id_midia': 'MID-1'})
    monkeypatch.setattr(lista_routes.lista_repository, 'adicionar_midia', lambda *_args: [{'mensagem': 'Mídia adicionada à lista!'}])
    monkeypatch.setattr(lista_routes.lista_repository, 'obter_item_usuario', lambda *_args: {'id_lista': 'LST-11'})

    progresso = []
    atualizacoes = []
    monkeypatch.setattr(lista_routes.lista_repository, 'atualizar_progresso', lambda *args: progresso.append(args))
    monkeypatch.setattr(lista_routes.lista_repository, 'atualizar_item', lambda lista_id, payload: atualizacoes.append((lista_id, payload)))

    response = client.post('/api/lista', headers=auth_headers, json={
        'id_anime': 'MID-1',
        'status_visualizacao': 'assistindo',
        'episodios_assistidos': 5,
        'data_fim': '2026-04-11',
        'notas_pessoais': 'comentario legado',
    })

    assert response.status_code == 201
    assert progresso == [('LST-11', 5, 'assistindo')]
    assert atualizacoes == [(
        'LST-11',
        {
            'comentario': 'comentario legado',
            'data_conclusao': '2026-04-11',
        },
    )]


def test_post_lista_rejeita_midia_inexistente(client, auth_headers, monkeypatch):
    monkeypatch.setattr(lista_routes.midia_repository, 'buscar_por_id', lambda _id: None)

    response = client.post('/api/lista/adicionar', headers=auth_headers, json={
        'id_midia': 'MID-404',
        'status': 'planejado',
    })

    assert response.status_code == 404
    assert response.get_json()['erro'] == 'Mídia não encontrada'


def test_post_lista_rejeita_duplicidade(client, auth_headers, monkeypatch):
    monkeypatch.setattr(lista_routes.midia_repository, 'buscar_por_id', lambda _id: {'id_midia': 'MID-1'})
    monkeypatch.setattr(
        lista_routes.lista_repository,
        'adicionar_midia',
        lambda *_args: [{'mensagem': 'A mídia já está na lista'}],
    )

    response = client.post('/api/lista/adicionar', headers=auth_headers, json={
        'id_midia': 'MID-1',
        'status': 'planejado',
    })

    assert response.status_code == 400
    assert 'já está na lista' in response.get_json()['erro']


def test_put_lista_atualiza_apenas_campos_enviados(client, auth_headers, monkeypatch):
    monkeypatch.setattr(lista_routes.lista_repository, 'obter_owner', lambda _id: 'USR-TEST-0001')
    progresso = []
    atualizacoes = []
    monkeypatch.setattr(lista_routes.lista_repository, 'atualizar_progresso', lambda *args: progresso.append(args))
    monkeypatch.setattr(lista_routes.lista_repository, 'atualizar_item', lambda lista_id, payload: atualizacoes.append((lista_id, payload)))

    response = client.put('/api/lista/LST-1', headers=auth_headers, json={
        'status_consumo': 'completo',
        'nota_usuario': 8,
        'favorito': True,
        'comentario': 'fechado',
        'progresso_atual': 24,
        'progresso_total': 24,
        'total_rewatches': 1,
        'privado': False,
    })

    assert response.status_code == 200
    assert progresso == [('LST-1', 24, 'completo')]
    assert atualizacoes == [(
        'LST-1',
        {
            'status_consumo': 'completo',
            'nota_usuario': 8.0,
            'favorito': True,
            'comentario': 'fechado',
            'total_rewatches': 1,
            'privado': False,
            'progresso_total': 24,
        },
    )]


def test_put_lista_rejeita_usuario_sem_ownership(client, auth_headers, monkeypatch):
    monkeypatch.setattr(lista_routes.lista_repository, 'obter_owner', lambda _id: 'USR-OUTRO-1')

    response = client.put('/api/lista/LST-1', headers=auth_headers, json={'comentario': 'x'})

    assert response.status_code == 403


def test_put_progresso_exige_campo_obrigatorio(client, auth_headers, monkeypatch):
    monkeypatch.setattr(lista_routes.lista_repository, 'obter_owner', lambda _id: 'USR-TEST-0001')

    response = client.put('/api/lista/LST-1/progresso', headers=auth_headers, json={})

    assert response.status_code == 400
    assert response.get_json()['erro'] == 'Progresso é obrigatório'


def test_put_progresso_atualiza_item(client, auth_headers, monkeypatch):
    monkeypatch.setattr(lista_routes.lista_repository, 'obter_owner', lambda _id: 'USR-TEST-0001')
    chamadas = []
    monkeypatch.setattr(lista_routes.lista_repository, 'atualizar_progresso', lambda *args: chamadas.append(args))

    response = client.put('/api/lista/LST-1/progresso', headers=auth_headers, json={
        'progresso_atual': 10,
        'status_consumo': 'assistindo',
    })

    assert response.status_code == 200
    assert chamadas == [('LST-1', 10, 'assistindo')]


def test_delete_lista_remove_item_do_usuario(client, auth_headers, monkeypatch):
    chamadas = []
    monkeypatch.setattr(lista_routes.lista_repository, 'remover_item', lambda lista_id, user_id: chamadas.append((lista_id, user_id)))

    response = client.delete('/api/lista/LST-1', headers=auth_headers)

    assert response.status_code == 200
    assert chamadas == [('LST-1', 'USR-TEST-0001')]
