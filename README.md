# MediaList

Sistema full stack para catálogo, listas pessoais, avaliações e notícias de quatro tipos de mídia:

- animes
- mangás
- jogos
- músicas

O projeto combina:

- backend Flask com MySQL e MongoDB
- frontend React com Create React App
- scripts de importação para AniList, RAWG e MusicBrainz

## Visão geral

O MediaList começou como um sistema de animes e foi expandido para um modelo multimídia. A base relacional agora usa uma tabela central de `midias` com tabelas filhas específicas por tipo:

- `animes`
- `mangas`
- `jogos`
- `musicas`

Além disso, o sistema oferece:

- autenticação com JWT
- controle de permissões por grupos
- lista pessoal por usuário
- avaliações e nota média agregada
- notificações e notícias com MongoDB
- importação automática de catálogos externos

## Stack

### Backend

- Python 3
- Flask
- `mysql-connector-python`
- `flask-jwt-extended`
- PyMongo

### Frontend

- React 19
- Create React App
- `lucide-react`
- React Testing Library

### Banco e serviços

- MySQL
- MongoDB
- mongo-express
- Docker Compose para MySQL, MongoDB e mongo-express

## Estrutura do projeto

```text
.
├── Backend/
│   ├── app.py
│   ├── config.py
│   ├── database.py
│   ├── docker-compose.yml
│   ├── importacao/
│   ├── repositories/
│   ├── routes/
│   ├── schemas/
│   └── test_*.py
├── Frontend/
│   ├── public/
│   ├── src/
│   └── package.json
├── Banco DDL.sql
├── Makefile
└── README.md
```

## Requisitos

Antes de rodar o projeto, garanta:

- Python 3.10+ instalado
- Node.js 18+ e npm instalados
- Docker e Docker Compose instalados

## Banco de dados

### MySQL

O schema principal está em [Banco DDL.sql](/home/artur/anilist/Projeto_LabBancoDados/Banco%20DDL.sql).

O arquivo cria:

- database `medialist_db`
- usuário `media_app_user`
- tabelas centrais e especializadas
- triggers
- procedures
- views
- dados iniciais

Padrões locais usados no projeto:

- host: `localhost`
- porta: `3308`
- database: `medialist_db`
- usuário: `media_app_user`
- container: `mysql-medialist`

O `docker compose` do backend agora também sobe o MySQL. Na primeira inicialização com volume vazio, o container aplica automaticamente o schema de `Banco DDL.sql` usando `/docker-entrypoint-initdb.d/`.

### MongoDB

O MongoDB é usado para:

- notícias
- notificações
- preferências
- atualizações de mídia

O Docker Compose do backend sobe:

- `mysql` em `localhost:3308`
- `mongodb` em `localhost:27017`
- `mongo-express` em `http://localhost:8081`

## Setup rápido

### 1. Instale as dependências

```bash
make install
```

### 2. Suba os serviços de banco

```bash
make services-up
```

Na primeira subida, o MySQL já inicializa o schema automaticamente.

### 3. Reaplique o schema se precisar recriar a base

```bash
make db-schema
```

Esse comando usa o cliente MySQL dentro do próprio container, então não depende de instalação local do servidor nem do binário `mysql`.

Se quiser abrir um shell SQL no banco do Docker:

```bash
make db-shell
```

### 4. Rode o backend

```bash
make backend-dev
```

Backend disponível em:

- `http://localhost:5000`

### 5. Rode o frontend

Em outro terminal:

```bash
make frontend-dev
```

Frontend disponível em:

- `http://localhost:3005`

## Comandos principais

O [Makefile](/home/artur/anilist/Projeto_LabBancoDados/Makefile) centraliza os fluxos mais comuns.

| Comando | O que faz |
|---|---|
| `make help` | Lista os comandos disponíveis |
| `make install` | Instala backend e frontend |
| `make services-up` | Sobe MySQL, MongoDB e mongo-express |
| `make services-down` | Derruba os serviços Docker |
| `make services-logs` | Mostra logs do Docker Compose |
| `make db-schema` | Reaplica `Banco DDL.sql` no MySQL do Docker |
| `make db-shell` | Abre o cliente MySQL dentro do container |
| `make backend-dev` | Inicia a API Flask |
| `make frontend-dev` | Inicia o frontend React |
| `make smoke-mysql` | Testa conexão e tabelas do MySQL |
| `make smoke-mongo` | Testa conexão com o MongoDB |
| `make smoke-permissions` | Testa a lógica de permissões |
| `make test-frontend` | Executa os testes do frontend |
| `make build-frontend` | Gera a build do frontend |
| `make import-animes` | Importa animes do AniList |
| `make import-mangas` | Importa mangás do AniList |
| `make import-jogos` | Importa jogos do RAWG |
| `make import-musicas` | Importa músicas do MusicBrainz |
| `make import-all` | Roda todos os importadores |

## Execução manual

Se preferir rodar sem `make`:

### Backend

```bash
cd Backend
python3 -m pip install -r requirements.txt
docker compose up -d
python3 app.py
```

Por padrão, o backend local acessa o MySQL do Docker em `localhost:3308`. Se no futuro o backend também for containerizado, basta sobrescrever `DB_HOST=mysql`.

### Frontend

```bash
cd Frontend
npm install
PORT=3005 npm start
```

## Importação de dados externos

Os importadores ficam em [Backend/importacao](/home/artur/anilist/Projeto_LabBancoDados/Backend/importacao).

### Fontes

- AniList GraphQL
  - animes
  - mangás
- RAWG
  - jogos
- MusicBrainz + Cover Art Archive
  - músicas

### Entrypoint

```bash
cd Backend
python3 -m importacao.run_import --tipo anime --paginas 10
python3 -m importacao.run_import --tipo manga --paginas 10
python3 -m importacao.run_import --tipo jogo --paginas 10
python3 -m importacao.run_import --tipo musica
python3 -m importacao.run_import --tipo todos --paginas 10
```

### Variáveis importantes

As configurações são lidas de `Backend/config.py` e `Backend/importacao/config.py`.

Você pode sobrescrever por ambiente:

```bash
export DB_HOST=localhost
export DB_PORT=3308
export DB_NAME=medialist_db
export DB_USER=media_app_user
export DB_PASSWORD='MediaList@2025!Secure'

export RAWG_API_KEY='sua-chave'
export MB_USER_AGENT='MediaListApp/1.0 (seu_email@exemplo.com)'
```

Observações:

- AniList não exige chave
- RAWG exige `RAWG_API_KEY`
- MusicBrainz exige `MB_USER_AGENT` descritivo

## API

### Autenticação

- `POST /api/auth/registro`
- `POST /api/auth/login`
- `POST /api/auth/logout`
- `GET /api/auth/me`

### Mídias

- `GET /api/midias?tipo=anime`
- `GET /api/midias?tipo=manga`
- `GET /api/midias?tipo=jogo`
- `GET /api/midias?tipo=musica`
- `GET /api/midias/<id_midia>`
- `PUT /api/midias/<id_midia>`
- `DELETE /api/midias/<id_midia>`
- `POST /api/midias/<id_midia>/atualizacoes`

### Rotas específicas por tipo

- `GET|POST /api/animes`
- `GET|PUT|DELETE /api/animes/<id>`
- `GET|POST /api/mangas`
- `GET /api/mangas/autor/<autor>`
- `GET /api/mangas/demografia/<demografia>`
- `GET|POST /api/jogos`
- `GET /api/jogos/plataforma/<plataforma>`
- `GET|POST /api/musicas`
- `GET /api/musicas/artista/<artista>`

### Lista e avaliações

- `GET /api/lista`
- `POST /api/lista/adicionar`
- `PUT /api/lista/<id_lista>`
- `PUT /api/lista/<id_lista>/progresso`
- `DELETE /api/lista/<id_lista>`
- `GET /api/avaliacoes/<id_midia>`
- `POST /api/avaliacoes`
- `PUT /api/avaliacoes/<id_avaliacao>`
- `DELETE /api/avaliacoes/<id_avaliacao>`

### Utilidades

- `GET /api/generos`
- `GET /api/notificacoes`
- `PUT /api/notificacoes/marcar-todas-lidas`
- `GET /api/health`
- `GET /api/midias/populares`
- `GET /api/animes/temporada`

## Frontend

O frontend já foi adaptado para:

- alternar entre animes, mangás, jogos e músicas
- listar o catálogo por tipo
- exibir detalhes polimórficos de mídia
- manter lista pessoal por tipo
- avaliar qualquer mídia
- mostrar estatísticas por tipo

Principais arquivos:

- [Frontend/src/App.js](/home/artur/anilist/Projeto_LabBancoDados/Frontend/src/App.js)
- [Frontend/src/components/Header.js](/home/artur/anilist/Projeto_LabBancoDados/Frontend/src/components/Header.js)
- [Frontend/src/components/MinhaListaTab.js](/home/artur/anilist/Projeto_LabBancoDados/Frontend/src/components/MinhaListaTab.js)
- [Frontend/src/components/AnimeDetalhesModal.js](/home/artur/anilist/Projeto_LabBancoDados/Frontend/src/components/AnimeDetalhesModal.js)

## Testes e validação

### Backend

Smoke scripts disponíveis:

```bash
make smoke-mysql
make smoke-mongo
make smoke-permissions
```

### Frontend

```bash
make test-frontend
make build-frontend
```

## Fluxo recomendado para desenvolvimento

1. Instale dependências com `make install`
2. Suba Mongo com `make services-up`
3. Aplique schema com `make db-schema`
4. Inicie backend com `make backend-dev`
5. Inicie frontend com `make frontend-dev`
6. Valide UI com `make test-frontend` e `make build-frontend`
7. Use os importadores quando quiser popular catálogo

## Documentação complementar local

Existem documentos de apoio no workspace com o detalhamento da expansão multimídia e do plano de importação. Eles estão ignorados pelo Git, mas podem ser usados localmente como referência:

- `ESPECIFICACAO_EXPANSAO_MULTIMIDIA.md`
- `PLANO_APIS_IMPORTACAO.md`
- `AnimeList.docx`

## Estado atual

O repositório já contém:

- DDL multimídia
- backend com rotas unificadas
- frontend adaptado para quatro tipos de mídia
- importadores externos
- `Makefile` para o fluxo principal

O que ainda depende do ambiente local:

- MySQL realmente inicializado com o schema
- serviços Mongo em execução
- chaves de API para RAWG
- `MB_USER_AGENT` configurado para importação de músicas
