.DEFAULT_GOAL := help

PYTHON ?= python3
PIP ?= $(PYTHON) -m pip
NPM ?= npm

ROOT_DIR := $(CURDIR)
BACKEND_DIR := $(ROOT_DIR)/Backend
FRONTEND_DIR := $(ROOT_DIR)/Frontend

.PHONY: help install install-backend install-frontend services-up services-down services-logs \
	db-schema db-shell backend-dev frontend-dev smoke-mysql smoke-mongo smoke-permissions \
	test-backend test-frontend test build-frontend build import-animes import-mangas \
	import-jogos import-musicas import-all clean-frontend

help:
	@printf "\nMediaList - comandos principais\n\n"
	@printf "  make install           Instala dependências de backend e frontend\n"
	@printf "  make services-up       Sobe MySQL, MongoDB e mongo-express via Docker Compose\n"
	@printf "  make db-schema         Reaplica Banco DDL.sql no MySQL do Docker\n"
	@printf "  make db-shell          Abre o cliente MySQL dentro do container\n"
	@printf "  make backend-dev       Inicia a API Flask em http://localhost:5000\n"
	@printf "  make frontend-dev      Inicia o frontend React em http://localhost:3005\n"
	@printf "  make smoke-mysql       Executa o script de verificação do MySQL\n"
	@printf "  make smoke-mongo       Executa o script de verificação do MongoDB\n"
	@printf "  make smoke-permissions Executa o script de permissões\n"
	@printf "  make test-frontend     Executa os testes do frontend\n"
	@printf "  make build-frontend    Gera a build do frontend\n"
	@printf "  make import-animes     Importa animes do AniList\n"
	@printf "  make import-mangas     Importa mangás do AniList\n"
	@printf "  make import-jogos      Importa jogos do RAWG\n"
	@printf "  make import-musicas    Importa músicas do MusicBrainz\n"
	@printf "  make import-all        Executa todos os importadores\n"
	@printf "  make services-down     Derruba os containers do Docker Compose\n"
	@printf "\nVariáveis de ambiente úteis: DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, RAWG_API_KEY, MB_USER_AGENT\n\n"

install: install-backend install-frontend

install-backend:
	cd $(BACKEND_DIR) && $(PIP) install -r requirements.txt

install-frontend:
	cd $(FRONTEND_DIR) && $(NPM) install

services-up:
	cd $(BACKEND_DIR) && docker compose up -d

services-down:
	cd $(BACKEND_DIR) && docker compose down

services-logs:
	cd $(BACKEND_DIR) && docker compose logs -f

db-schema:
	cd $(BACKEND_DIR) && docker compose up -d mysql
	cd $(BACKEND_DIR) && docker compose exec -T mysql sh -lc 'until mysqladmin ping -h 127.0.0.1 -uroot -proot --silent; do sleep 2; done; exec mysql -uroot -proot' < "$(ROOT_DIR)/Banco DDL.sql"

db-shell:
	cd $(BACKEND_DIR) && docker compose up -d mysql
	cd $(BACKEND_DIR) && docker compose exec mysql mysql -uroot -proot

backend-dev:
	cd $(BACKEND_DIR) && $(PYTHON) app.py

frontend-dev:
	cd $(FRONTEND_DIR) && PORT=3005 $(NPM) start

smoke-mysql:
	cd $(BACKEND_DIR) && $(PYTHON) test_mysql_connection.py

smoke-mongo:
	cd $(BACKEND_DIR) && $(PYTHON) test_mongo.py

smoke-permissions:
	cd $(BACKEND_DIR) && $(PYTHON) test_permissions.py

test-backend: smoke-mysql smoke-mongo smoke-permissions

test-frontend:
	cd $(FRONTEND_DIR) && $(NPM) test -- --watchAll=false

test: test-frontend

build-frontend:
	cd $(FRONTEND_DIR) && $(NPM) run build

build: build-frontend

import-animes:
	cd $(BACKEND_DIR) && $(PYTHON) -m importacao.run_import --tipo anime --paginas 10

import-mangas:
	cd $(BACKEND_DIR) && $(PYTHON) -m importacao.run_import --tipo manga --paginas 10

import-jogos:
	cd $(BACKEND_DIR) && $(PYTHON) -m importacao.run_import --tipo jogo --paginas 10

import-musicas:
	cd $(BACKEND_DIR) && $(PYTHON) -m importacao.run_import --tipo musica

import-all:
	cd $(BACKEND_DIR) && $(PYTHON) -m importacao.run_import --tipo todos --paginas 10

clean-frontend:
	rm -rf $(FRONTEND_DIR)/build
