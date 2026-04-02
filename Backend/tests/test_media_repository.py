from datetime import date, datetime
from decimal import Decimal

from repositories.midia_repository import ListaRepository, MidiaRepository, _serialize_row, _serialize_value

from .helpers import FakeConnection, FakeCursor


def test_serialize_value_converte_decimal_e_datas():
    assert _serialize_value(Decimal('9.5')) == 9.5
    assert _serialize_value(date(2026, 4, 2)) == '2026-04-02'
    assert _serialize_value(datetime(2026, 4, 2, 10, 30, 0)) == '2026-04-02T10:30:00'


def test_serialize_row_gera_generos_lista():
    row = _serialize_row({
        'nota_media': Decimal('8.7'),
        'generos': 'Ação, Drama, Fantasia',
    })

    assert row == {
        'nota_media': 8.7,
        'generos': 'Ação, Drama, Fantasia',
        'generos_lista': ['Ação', 'Drama', 'Fantasia'],
    }


def test_build_filters_monta_clausulas_por_tipo():
    repo = MidiaRepository()

    where, params = repo._build_filters('jogo', {
        'busca': 'zelda',
        'genero': 'Aventura',
        'status': 'lancado',
        'plataforma': 'Switch',
        'desenvolvedor': 'Nintendo',
        'modo_jogo': 'single',
    })

    assert 'tm.nome_tipo = %s' in where
    assert 'm.titulo_portugues LIKE %s' in where
    assert 'j.status_jogo = %s' in where
    assert 'j.plataformas LIKE %s' in where
    assert 'j.desenvolvedor LIKE %s' in where
    assert 'j.modo_jogo = %s' in where
    assert params == [
        'jogo',
        '%zelda%',
        '%zelda%',
        '%zelda%',
        'Aventura',
        'lancado',
        '%Switch%',
        '%Nintendo%',
        'single',
    ]


def test_buscar_por_id_combina_campos_base_e_tipo(monkeypatch):
    repo = MidiaRepository()
    capturado = {}

    def fake_fetch_one(query, params):
        capturado['query'] = query
        capturado['params'] = params
        return {'id_midia': 'MID-1', 'tipo': 'anime'}

    monkeypatch.setattr(repo, '_fetch_one', fake_fetch_one)

    result = repo.buscar_por_id('MID-1', expected_type='anime')

    assert result == {'id_midia': 'MID-1', 'tipo': 'anime'}
    assert 'LEFT JOIN animes' in capturado['query']
    assert capturado['params'] == ['MID-1', 'anime']


def test_obter_item_usuario_retorna_item(monkeypatch):
    repo = ListaRepository()
    monkeypatch.setattr(repo, '_fetch_one', lambda *_args, **_kwargs: {'id_lista': 'LST-1', 'id_usuario': 'USR-1', 'id_midia': 'MID-1'})

    result = repo.obter_item_usuario('USR-1', 'MID-1')

    assert result['id_lista'] == 'LST-1'


def test_atualizar_item_persiste_apenas_colunas_permitidas(monkeypatch):
    cursor = FakeCursor()
    connection = FakeConnection(cursor)
    monkeypatch.setattr('repositories.midia_repository.get_db_connection', lambda: connection)

    repo = ListaRepository()
    result = repo.atualizar_item('LST-1', {
        'status_consumo': 'assistindo',
        'nota_usuario': None,
        'favorito': 1,
        'comentario': 'Teste',
        'privado': 0,
        'campo_invalido': 'ignorar',
    })

    query, params = cursor.executed[0]
    assert result is True
    assert 'status_consumo = %s' in query
    assert 'nota_usuario = NULL' in query
    assert 'favorito = %s' in query
    assert 'comentario = %s' in query
    assert 'privado = %s' in query
    assert 'campo_invalido' not in query
    assert params == ('assistindo', True, 'Teste', False, 'LST-1')
