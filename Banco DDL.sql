-- ============================================
-- SCHEMA COMPLETO - SISTEMA DE GERENCIAMENTO DE ANIMES
-- COM IDs CUSTOMIZADOS (SEM AUTO_INCREMENT)
-- ============================================

DROP DATABASE IF EXISTS anime_list_db;
CREATE DATABASE anime_list_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE anime_list_db;

-- ============================================
-- TABELA DE SEQUÊNCIAS (para geração de IDs customizados)
-- ============================================

CREATE TABLE sequences (
                           seq_name VARCHAR(50) PRIMARY KEY,
                           seq_value BIGINT NOT NULL DEFAULT 0,
                           prefix VARCHAR(10),
                           description VARCHAR(200)
) ENGINE=InnoDB;

-- Inserir sequências iniciais
INSERT INTO sequences (seq_name, seq_value, prefix, description) VALUES
                                                                     ('usuario_seq', 1000, 'USR', 'Sequência para IDs de usuários'),
                                                                     ('anime_seq', 10000, 'ANM', 'Sequência para IDs de animes'),
                                                                     ('lista_seq', 1, 'LST', 'Sequência para lista de usuários'),
                                                                     ('avaliacao_seq', 1, 'AVL', 'Sequência para avaliações');

-- ============================================
-- FUNCTIONS PARA GERAÇÃO DE IDs
-- ============================================

DELIMITER $$

-- Function para obter próximo ID de uma sequência
CREATE FUNCTION get_next_sequence(p_seq_name VARCHAR(50))
    RETURNS BIGINT
    DETERMINISTIC
BEGIN
    DECLARE v_next_val BIGINT;

    UPDATE sequences
    SET seq_value = seq_value + 1
    WHERE seq_name = p_seq_name;

    SELECT seq_value INTO v_next_val
    FROM sequences
    WHERE seq_name = p_seq_name;

    RETURN v_next_val;
END$$

-- Function para gerar ID de usuário (formato: USR-YYYYMMDD-XXXXX)
CREATE FUNCTION gerar_id_usuario()
    RETURNS VARCHAR(50)
    DETERMINISTIC
BEGIN
    DECLARE v_seq BIGINT;
    DECLARE v_id VARCHAR(50);
    DECLARE v_data VARCHAR(8);

    SET v_seq = get_next_sequence('usuario_seq');
    SET v_data = DATE_FORMAT(CURDATE(), '%Y%m%d');
    SET v_id = CONCAT('USR-', v_data, '-', LPAD(v_seq, 5, '0'));

    RETURN v_id;
END$$

-- Function para gerar ID de anime (formato: ANM-TIPO-XXXXX)
CREATE FUNCTION gerar_id_anime(p_tipo VARCHAR(10))
    RETURNS VARCHAR(50)
    DETERMINISTIC
BEGIN
    DECLARE v_seq BIGINT;
    DECLARE v_id VARCHAR(50);
    DECLARE v_ano VARCHAR(4);

    SET v_seq = get_next_sequence('anime_seq');
    SET v_ano = YEAR(CURDATE());
    SET v_id = CONCAT('ANM-', UPPER(p_tipo), '-', v_ano, '-', LPAD(v_seq, 5, '0'));

    RETURN v_id;
END$$

-- Function para gerar código único de anime baseado no título
CREATE FUNCTION gerar_codigo_anime(p_titulo VARCHAR(200))
    RETURNS VARCHAR(20)
    DETERMINISTIC
BEGIN
    DECLARE v_codigo VARCHAR(20);
    DECLARE v_prefixo VARCHAR(10);
    DECLARE v_contador INT;
    DECLARE v_existe INT;
    DECLARE v_tentativas INT DEFAULT 0;
    DECLARE v_max_tentativas INT DEFAULT 1000;

    -- Extrair prefixo de 3 letras do título (removendo espaços, : e -)
    SET v_prefixo = UPPER(LEFT(REPLACE(REPLACE(REPLACE(p_titulo, ' ', ''), ':', ''), '-', ''), 3));

    -- Se o prefixo tiver menos de 3 caracteres, completar com 'X'
    IF LENGTH(v_prefixo) < 3 THEN
        SET v_prefixo = RPAD(v_prefixo, 3, 'X');
    END IF;

    -- Iniciar contador em 1
    SET v_contador = 1;

    -- Loop até encontrar um código único
    REPEAT
        SET v_codigo = CONCAT(v_prefixo, YEAR(CURDATE()), LPAD(v_contador, 4, '0'));

        -- Verificar se o código já existe
        SELECT COUNT(*) INTO v_existe
        FROM animes
        WHERE codigo_anime = v_codigo;

-- Se já existe, incrementar contador
        IF v_existe > 0 THEN
            SET v_contador = v_contador + 1;
            SET v_tentativas = v_tentativas + 1;
        END IF;

    UNTIL v_existe = 0 OR v_tentativas >= v_max_tentativas
        END REPEAT;

    -- Se atingiu o máximo de tentativas, usar sequência global
    IF v_tentativas >= v_max_tentativas THEN
        SET v_codigo = CONCAT('ANM', YEAR(CURDATE()), LPAD(get_next_sequence('anime_seq'), 5, '0'));
    END IF;

    RETURN v_codigo;
END$$


-- Function para gerar UUID customizado
CREATE FUNCTION gerar_uuid_customizado(p_prefixo VARCHAR(5))
    RETURNS VARCHAR(50)
    DETERMINISTIC
BEGIN
    DECLARE v_uuid VARCHAR(50);
    DECLARE v_timestamp VARCHAR(20);
    DECLARE v_random VARCHAR(10);

    SET v_timestamp = UNIX_TIMESTAMP();
    SET v_random = FLOOR(RAND() * 9999999999);
    SET v_uuid = CONCAT(p_prefixo, '-', v_timestamp, '-', v_random);

    RETURN v_uuid;
END$$

DELIMITER ;

-- ============================================
-- TABELAS PRINCIPAIS
-- ============================================

-- Tabela de usuários
CREATE TABLE usuarios (
                          id_usuario VARCHAR(50) NOT NULL,
                          codigo_usuario VARCHAR(20) NOT NULL UNIQUE,  -- Código único gerado
                          nome_completo VARCHAR(100) NOT NULL,
                          email VARCHAR(100) NOT NULL UNIQUE,
                          senha_hash VARCHAR(255) NOT NULL,
                          data_nascimento DATE,
                          foto_perfil VARCHAR(255),
                          biografia TEXT,
                          data_cadastro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                          ultimo_acesso TIMESTAMP NULL,
                          ativo BOOLEAN DEFAULT TRUE,
                          PRIMARY KEY (id_usuario),
                          INDEX idx_codigo (codigo_usuario),
                          INDEX idx_email (email),
                          INDEX idx_ativo (ativo)
) ENGINE=InnoDB;

-- Tabela de grupos de usuários
CREATE TABLE grupos_usuarios (
                                 id_grupo INT NOT NULL AUTO_INCREMENT,  -- AUTO_INCREMENT: poucos registros fixos (3 grupos)
                                 nome_grupo VARCHAR(50) NOT NULL UNIQUE,
                                 descricao TEXT,
                                 nivel_acesso ENUM('admin', 'moderador', 'usuario') NOT NULL,
                                 pode_criar BOOLEAN DEFAULT TRUE,
                                 pode_editar BOOLEAN DEFAULT TRUE,
                                 pode_deletar BOOLEAN DEFAULT FALSE,
                                 pode_moderar BOOLEAN DEFAULT FALSE,
                                 PRIMARY KEY (id_grupo),
                                 INDEX idx_nivel_acesso (nivel_acesso)
) ENGINE=InnoDB AUTO_INCREMENT=1;

-- Relacionamento usuários e grupos
CREATE TABLE usuarios_grupos (
                                 id_usuario VARCHAR(50) NOT NULL,
                                 id_grupo INT NOT NULL,
                                 data_inclusao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                 PRIMARY KEY (id_usuario, id_grupo),
                                 FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
                                 FOREIGN KEY (id_grupo) REFERENCES grupos_usuarios(id_grupo) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabela de animes
CREATE TABLE animes (
                        id_anime VARCHAR(50) NOT NULL,
                        codigo_anime VARCHAR(20) NOT NULL UNIQUE,  -- Código gerado
                        titulo_original VARCHAR(200) NOT NULL,
                        titulo_ingles VARCHAR(200),
                        titulo_portugues VARCHAR(200),
                        sinopse TEXT,
                        data_lancamento DATE,
                        status_anime ENUM('em_exibicao', 'finalizado', 'aguardando', 'cancelado') DEFAULT 'aguardando',
                        numero_episodios INT,
                        duracao_episodio INT COMMENT 'Duração em minutos',
                        classificacao_etaria VARCHAR(10),
                        nota_media DECIMAL(3,2) DEFAULT 0.00,
                        total_avaliacoes INT DEFAULT 0,
                        poster_url VARCHAR(255),
                        banner_url VARCHAR(255),
                        trailer_url VARCHAR(255),
                        estudio VARCHAR(100),
                        fonte_original VARCHAR(100) COMMENT 'Manga, Light Novel, Original, etc',
                        data_criacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                        PRIMARY KEY (id_anime),
                        INDEX idx_codigo (codigo_anime),
                        INDEX idx_status (status_anime),
                        INDEX idx_nota (nota_media),
                        INDEX idx_titulo (titulo_portugues),
                        FULLTEXT idx_busca (titulo_original, titulo_portugues, sinopse)
) ENGINE=InnoDB;

-- Tabela de gêneros
CREATE TABLE generos (
                         id_genero INT NOT NULL AUTO_INCREMENT,  -- AUTO_INCREMENT: lista fixa de gêneros (~20 registros)
                         nome_genero VARCHAR(50) NOT NULL UNIQUE,
                         descricao TEXT,
                         PRIMARY KEY (id_genero),
                         INDEX idx_nome (nome_genero)
) ENGINE=InnoDB AUTO_INCREMENT=1;

-- Relacionamento animes e gêneros
CREATE TABLE animes_generos (
                                id_anime VARCHAR(50) NOT NULL,
                                id_genero INT NOT NULL,
                                PRIMARY KEY (id_anime, id_genero),
                                FOREIGN KEY (id_anime) REFERENCES animes(id_anime) ON DELETE CASCADE,
                                FOREIGN KEY (id_genero) REFERENCES generos(id_genero) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Tabela de lista de usuários (usa sequência customizada)
CREATE TABLE lista_usuarios (
                                id_lista VARCHAR(50) NOT NULL,
                                codigo_lista VARCHAR(50) NOT NULL UNIQUE,  -- Formato: LSTYYYYMMDD-XXXXXX (sequência única)
                                id_usuario VARCHAR(50) NOT NULL,
                                id_anime VARCHAR(50) NOT NULL,
                                status_visualizacao ENUM('assistindo', 'completo', 'planejado', 'pausado', 'abandonado') NOT NULL,
                                episodios_assistidos INT DEFAULT 0,
                                nota_usuario DECIMAL(3,2),
                                favorito BOOLEAN DEFAULT FALSE,
                                data_inicio DATE,
                                data_conclusao DATE,
                                comentario TEXT,
                                data_adicao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                data_atualizacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                                PRIMARY KEY (id_lista),
                                UNIQUE KEY uk_usuario_anime (id_usuario, id_anime),
                                FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
                                FOREIGN KEY (id_anime) REFERENCES animes(id_anime) ON DELETE CASCADE,
                                INDEX idx_codigo (codigo_lista),
                                INDEX idx_status (status_visualizacao),
                                INDEX idx_favorito (favorito)
) ENGINE=InnoDB;

-- Tabela de avaliações
CREATE TABLE avaliacoes (
                            id_avaliacao VARCHAR(50) NOT NULL,
                            codigo_avaliacao VARCHAR(30) NOT NULL UNIQUE,
                            id_usuario VARCHAR(50) NOT NULL,
                            id_anime VARCHAR(50) NOT NULL,
                            nota DECIMAL(3,2) NOT NULL CHECK (nota >= 0 AND nota <= 10),
                            titulo_avaliacao VARCHAR(200),
                            texto_avaliacao TEXT,
                            data_avaliacao TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                            data_edicao TIMESTAMP NULL,
                            likes INT DEFAULT 0,
                            dislikes INT DEFAULT 0,
                            PRIMARY KEY (id_avaliacao),
                            UNIQUE KEY uk_usuario_anime_avaliacao (id_usuario, id_anime),
                            FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
                            FOREIGN KEY (id_anime) REFERENCES animes(id_anime) ON DELETE CASCADE,
                            INDEX idx_codigo (codigo_avaliacao),
                            INDEX idx_nota (nota),
                            INDEX idx_data (data_avaliacao)
) ENGINE=InnoDB;

-- Tabela de comentários (AUTO_INCREMENT justificado)
CREATE TABLE comentarios_avaliacoes (
                                        id_comentario INT NOT NULL AUTO_INCREMENT,
                                        id_avaliacao VARCHAR(50) NOT NULL,
                                        id_usuario VARCHAR(50) NOT NULL,
                                        texto_comentario TEXT NOT NULL,
                                        data_comentario TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                                        PRIMARY KEY (id_comentario),
                                        FOREIGN KEY (id_avaliacao) REFERENCES avaliacoes(id_avaliacao) ON DELETE CASCADE,
                                        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario) ON DELETE CASCADE,
                                        INDEX idx_avaliacao (id_avaliacao)
) ENGINE=InnoDB;


-- ============================================
-- TRIGGERS
-- ============================================

DELIMITER $$

-- Trigger para gerar ID do usuário antes de inserir
CREATE TRIGGER before_insert_usuario
    BEFORE INSERT ON usuarios
    FOR EACH ROW
BEGIN
    IF NEW.id_usuario IS NULL OR NEW.id_usuario = '' THEN
        SET NEW.id_usuario = gerar_id_usuario();
    END IF;

    IF NEW.codigo_usuario IS NULL OR NEW.codigo_usuario = '' THEN
        SET NEW.codigo_usuario = CONCAT('USR', LPAD(get_next_sequence('usuario_seq'), 8, '0'));
    END IF;
END$$

-- Trigger para gerar ID do anime antes de inserir
CREATE TRIGGER before_insert_anime
    BEFORE INSERT ON animes
    FOR EACH ROW
BEGIN
    IF NEW.id_anime IS NULL OR NEW.id_anime = '' THEN
        SET NEW.id_anime = gerar_id_anime('STD');
    END IF;

    IF NEW.codigo_anime IS NULL OR NEW.codigo_anime = '' THEN
        SET NEW.codigo_anime = gerar_codigo_anime(NEW.titulo_original);
    END IF;
END$$

-- Trigger para gerar ID da lista antes de inserir
CREATE TRIGGER before_insert_lista
    BEFORE INSERT ON lista_usuarios
    FOR EACH ROW
BEGIN
    DECLARE v_seq BIGINT;

    IF NEW.id_lista IS NULL OR NEW.id_lista = '' THEN
        SET NEW.id_lista = gerar_uuid_customizado('LST');
    END IF;

    IF NEW.codigo_lista IS NULL OR NEW.codigo_lista = '' THEN
        -- Gerar código único usando sequência para evitar colisões
        SET v_seq = get_next_sequence('lista_seq');
        SET NEW.codigo_lista = CONCAT('LST', DATE_FORMAT(NOW(), '%Y%m%d'), '-', LPAD(v_seq, 6, '0'));
    END IF;
END$$

-- Trigger para gerar ID da avaliação antes de inserir
CREATE TRIGGER before_insert_avaliacao
    BEFORE INSERT ON avaliacoes
    FOR EACH ROW
BEGIN
    IF NEW.id_avaliacao IS NULL OR NEW.id_avaliacao = '' THEN
        SET NEW.id_avaliacao = gerar_uuid_customizado('AVL');
    END IF;

    IF NEW.codigo_avaliacao IS NULL OR NEW.codigo_avaliacao = '' THEN
        SET NEW.codigo_avaliacao = CONCAT('AVL', DATE_FORMAT(NOW(), '%Y%m%d'), '-', FLOOR(RAND() * 99999));
    END IF;
END$$

-- Trigger: Atualizar nota média do anime após inserir avaliação
CREATE TRIGGER atualizar_nota_media_insert
    AFTER INSERT ON avaliacoes
    FOR EACH ROW
BEGIN
    UPDATE animes
    SET nota_media = (
        SELECT ROUND(AVG(nota), 2)
        FROM avaliacoes
        WHERE id_anime = NEW.id_anime
    ),
        total_avaliacoes = (
            SELECT COUNT(*)
            FROM avaliacoes
            WHERE id_anime = NEW.id_anime
        )
    WHERE id_anime = NEW.id_anime;
END$$

-- Trigger: Atualizar nota média do anime após atualizar avaliação
CREATE TRIGGER atualizar_nota_media_update
    AFTER UPDATE ON avaliacoes
    FOR EACH ROW
BEGIN
    UPDATE animes
    SET nota_media = (
        SELECT ROUND(AVG(nota), 2)
        FROM avaliacoes
        WHERE id_anime = NEW.id_anime
    )
    WHERE id_anime = NEW.id_anime;
END$$

-- Trigger: Validar episódios assistidos
CREATE TRIGGER validar_episodios_assistidos
    BEFORE INSERT ON lista_usuarios
    FOR EACH ROW
BEGIN
    DECLARE v_total_eps INT;

    SELECT numero_episodios INTO v_total_eps
    FROM animes
    WHERE id_anime = NEW.id_anime;

    IF v_total_eps IS NOT NULL AND NEW.episodios_assistidos > v_total_eps THEN
        SIGNAL SQLSTATE '45000'
            SET MESSAGE_TEXT = 'Número de episódios assistidos não pode ser maior que o total';
    END IF;
END$$

-- Trigger: Registrar último acesso do usuário
CREATE TRIGGER registrar_ultimo_acesso
    BEFORE UPDATE ON usuarios
    FOR EACH ROW
BEGIN
    IF NEW.ativo = TRUE AND OLD.ativo = TRUE THEN
        SET NEW.ultimo_acesso = CURRENT_TIMESTAMP;
    END IF;
END$$

DELIMITER ;

-- ============================================
-- PROCEDURES
-- ============================================

DELIMITER $$

-- Procedure para adicionar anime à lista do usuário
CREATE PROCEDURE adicionar_anime_lista(
    IN p_id_usuario VARCHAR(50),
    IN p_id_anime VARCHAR(50),
    IN p_status VARCHAR(20)
)
BEGIN
    DECLARE v_existe INT;
    DECLARE v_novo_id VARCHAR(50);

    SELECT COUNT(*) INTO v_existe
    FROM lista_usuarios
    WHERE id_usuario = p_id_usuario AND id_anime = p_id_anime;

    IF v_existe = 0 THEN
        -- Não gera id_lista e codigo_lista aqui, deixa a trigger fazer isso
        INSERT INTO lista_usuarios (id_usuario, id_anime, status_visualizacao)
        VALUES (p_id_usuario, p_id_anime, p_status);

        -- Busca o id_lista gerado pela trigger
        SELECT id_lista INTO v_novo_id
        FROM lista_usuarios
        WHERE id_usuario = p_id_usuario AND id_anime = p_id_anime;

        SELECT 'Anime adicionado com sucesso!' AS mensagem, v_novo_id as id_lista;
    ELSE
        SELECT 'Anime já está na lista do usuário!' AS mensagem;
    END IF;
END$$

-- Procedure para atualizar progresso do anime
CREATE PROCEDURE atualizar_progresso_anime(
    IN p_id_lista VARCHAR(50),
    IN p_episodios_assistidos INT,
    IN p_novo_status VARCHAR(20)
)
BEGIN
    DECLARE v_total_episodios INT;
    DECLARE v_id_anime VARCHAR(50);

    SELECT a.numero_episodios, lu.id_anime INTO v_total_episodios, v_id_anime
    FROM lista_usuarios lu
             JOIN animes a ON lu.id_anime = a.id_anime
    WHERE lu.id_lista = p_id_lista;

    UPDATE lista_usuarios
    SET episodios_assistidos = p_episodios_assistidos,
        status_visualizacao = CASE
                                  WHEN v_total_episodios IS NOT NULL AND p_episodios_assistidos >= v_total_episodios THEN 'completo'
                                  ELSE p_novo_status
            END,
        data_conclusao = CASE
                             WHEN v_total_episodios IS NOT NULL AND p_episodios_assistidos >= v_total_episodios THEN CURDATE()
                             ELSE data_conclusao
            END
    WHERE id_lista = p_id_lista;

    SELECT 'Progresso atualizado!' AS mensagem;
END$$

-- Procedure para calcular estatísticas do usuário
CREATE PROCEDURE obter_estatisticas_usuario(IN p_id_usuario VARCHAR(50))
BEGIN
    SELECT
        COUNT(DISTINCT lu.id_anime) AS total_animes,
        SUM(CASE WHEN lu.status_visualizacao = 'completo' THEN 1 ELSE 0 END) AS animes_completos,
        SUM(CASE WHEN lu.status_visualizacao = 'assistindo' THEN 1 ELSE 0 END) AS animes_assistindo,
        SUM(lu.episodios_assistidos) AS total_episodios_assistidos,
        ROUND(AVG(lu.nota_usuario), 2) AS nota_media,
        COUNT(DISTINCT CASE WHEN lu.favorito = TRUE THEN lu.id_anime END) AS total_favoritos,
        DATEDIFF(CURDATE(), MIN(lu.data_adicao)) AS dias_desde_primeiro_anime
    FROM lista_usuarios lu
    WHERE lu.id_usuario = p_id_usuario;
END$$

-- Procedure para inserir ou atualizar anime (para script de importação)
CREATE PROCEDURE inserir_ou_atualizar_anime(
    IN p_titulo_original VARCHAR(200),
    IN p_titulo_ingles VARCHAR(200),
    IN p_titulo_portugues VARCHAR(200),
    IN p_sinopse TEXT,
    IN p_data_lancamento DATE,
    IN p_status_anime VARCHAR(20),
    IN p_numero_episodios INT,
    IN p_duracao_episodio INT,
    IN p_classificacao_etaria VARCHAR(10),
    IN p_nota_media DECIMAL(3,2),
    IN p_poster_url VARCHAR(255),
    IN p_banner_url VARCHAR(255),
    IN p_estudio VARCHAR(100),
    IN p_fonte_original VARCHAR(100),
    OUT p_id_anime VARCHAR(50),
    OUT p_ja_existia BOOLEAN
)
BEGIN
    DECLARE v_existe VARCHAR(50);
    DECLARE v_novo_id VARCHAR(50);
    DECLARE v_novo_codigo VARCHAR(20);

    SELECT id_anime INTO v_existe
    FROM animes
    WHERE titulo_original = p_titulo_original
    LIMIT 1;

    IF v_existe IS NOT NULL THEN
        UPDATE animes
        SET
            titulo_ingles = COALESCE(p_titulo_ingles, titulo_ingles),
            titulo_portugues = COALESCE(p_titulo_portugues, titulo_portugues),
            sinopse = COALESCE(p_sinopse, sinopse),
            data_lancamento = COALESCE(p_data_lancamento, data_lancamento),
            status_anime = COALESCE(p_status_anime, status_anime),
            numero_episodios = COALESCE(p_numero_episodios, numero_episodios),
            duracao_episodio = COALESCE(p_duracao_episodio, duracao_episodio),
            classificacao_etaria = COALESCE(p_classificacao_etaria, classificacao_etaria),
            nota_media = COALESCE(p_nota_media, nota_media),
            poster_url = COALESCE(p_poster_url, poster_url),
            banner_url = COALESCE(p_banner_url, banner_url),
            estudio = COALESCE(p_estudio, estudio),
            fonte_original = COALESCE(p_fonte_original, fonte_original),
            data_atualizacao = NOW()
        WHERE id_anime = v_existe;

        SET p_id_anime = v_existe;
        SET p_ja_existia = TRUE;
    ELSE
        SET v_novo_id = gerar_id_anime('IMP');
        SET v_novo_codigo = gerar_codigo_anime(p_titulo_original);

        INSERT INTO animes (
            id_anime, codigo_anime, titulo_original, titulo_ingles, titulo_portugues, sinopse,
            data_lancamento, status_anime, numero_episodios, duracao_episodio,
            classificacao_etaria, nota_media, poster_url, banner_url,
            estudio, fonte_original
        ) VALUES (
                     v_novo_id, v_novo_codigo, p_titulo_original, p_titulo_ingles, p_titulo_portugues, p_sinopse,
                     p_data_lancamento, p_status_anime, p_numero_episodios, p_duracao_episodio,
                     p_classificacao_etaria, p_nota_media, p_poster_url, p_banner_url,
                     p_estudio, p_fonte_original
                 );

        SET p_id_anime = v_novo_id;
        SET p_ja_existia = FALSE;
    END IF;
END$$

DELIMITER ;

-- ============================================
-- VIEWS
-- ============================================

CREATE VIEW vw_animes_populares AS
SELECT
    a.id_anime,
    a.codigo_anime,
    a.titulo_portugues,
    a.poster_url,
    a.nota_media,
    COUNT(DISTINCT lu.id_usuario) AS total_usuarios,
    SUM(CASE WHEN lu.status_visualizacao = 'completo' THEN 1 ELSE 0 END) AS usuarios_completaram,
    SUM(CASE WHEN lu.favorito = TRUE THEN 1 ELSE 0 END) AS total_favoritos,
    GROUP_CONCAT(DISTINCT g.nome_genero ORDER BY g.nome_genero SEPARATOR ', ') AS generos
FROM animes a
         LEFT JOIN lista_usuarios lu ON a.id_anime = lu.id_anime
         LEFT JOIN animes_generos ag ON a.id_anime = ag.id_anime
         LEFT JOIN generos g ON ag.id_genero = g.id_genero
GROUP BY a.id_anime, a.codigo_anime, a.titulo_portugues, a.poster_url, a.nota_media
HAVING total_usuarios > 0
ORDER BY total_usuarios DESC, nota_media DESC;

CREATE VIEW vw_animes_temporada_atual AS
SELECT
    a.id_anime,
    a.codigo_anime,
    a.titulo_portugues,
    a.sinopse,
    a.poster_url,
    a.banner_url,
    a.nota_media,
    a.status_anime,
    a.data_lancamento,
    GROUP_CONCAT(DISTINCT g.nome_genero ORDER BY g.nome_genero SEPARATOR ', ') AS generos,
    COUNT(DISTINCT lu.id_usuario) AS total_usuarios
FROM animes a
         LEFT JOIN animes_generos ag ON a.id_anime = ag.id_anime
         LEFT JOIN generos g ON ag.id_genero = g.id_genero
         LEFT JOIN lista_usuarios lu ON a.id_anime = lu.id_anime
WHERE a.status_anime = 'em_exibicao'
  AND QUARTER(a.data_lancamento) = QUARTER(CURDATE())
  AND YEAR(a.data_lancamento) = YEAR(CURDATE())
GROUP BY a.id_anime, a.codigo_anime, a.titulo_portugues, a.sinopse, a.poster_url,
         a.banner_url, a.nota_media, a.status_anime, a.data_lancamento
ORDER BY a.nota_media DESC, total_usuarios DESC;

CREATE VIEW vw_perfil_usuario AS
SELECT
    u.id_usuario,
    u.codigo_usuario,
    u.nome_completo,
    u.email,
    u.foto_perfil,
    u.biografia,
    u.data_cadastro,
    COUNT(DISTINCT lu.id_anime) AS total_animes,
    SUM(CASE WHEN lu.status_visualizacao = 'completo' THEN 1 ELSE 0 END) AS animes_completos,
    SUM(lu.episodios_assistidos) AS episodios_assistidos,
    ROUND(AVG(lu.nota_usuario), 2) AS nota_media_usuario,
    COUNT(DISTINCT CASE WHEN lu.favorito = TRUE THEN lu.id_anime END) AS total_favoritos,
    GROUP_CONCAT(DISTINCT gu.nome_grupo SEPARATOR ', ') AS grupos
FROM usuarios u
         LEFT JOIN lista_usuarios lu ON u.id_usuario = lu.id_usuario
         LEFT JOIN usuarios_grupos ug ON u.id_usuario = ug.id_usuario
         LEFT JOIN grupos_usuarios gu ON ug.id_grupo = gu.id_grupo
GROUP BY u.id_usuario, u.codigo_usuario, u.nome_completo, u.email, u.foto_perfil,
         u.biografia, u.data_cadastro;

-- ============================================
-- ÍNDICES ADICIONAIS
-- ============================================

CREATE INDEX idx_lista_status_usuario ON lista_usuarios(id_usuario, status_visualizacao);
CREATE INDEX idx_avaliacoes_anime_nota ON avaliacoes(id_anime, nota);
CREATE INDEX idx_animes_data_lancamento ON animes(data_lancamento);

-- ============================================
-- DADOS INICIAIS
-- ============================================

-- Inserir grupos de usuários (AUTO_INCREMENT justificado)
INSERT INTO grupos_usuarios (nome_grupo, descricao, nivel_acesso, pode_criar, pode_editar, pode_deletar, pode_moderar) VALUES
                                                                                                                           ('Administradores', 'Acesso total ao sistema', 'admin', TRUE, TRUE, TRUE, TRUE),
                                                                                                                           ('Moderadores', 'Pode moderar conteúdo', 'moderador', TRUE, TRUE, FALSE, TRUE),
                                                                                                                           ('Usuários', 'Usuários regulares', 'usuario', FALSE, FALSE, FALSE, FALSE);

-- Inserir gêneros (AUTO_INCREMENT justificado)
INSERT INTO generos (nome_genero, descricao) VALUES
                                                 ('Ação', 'Animes com cenas de ação e combate'),
                                                 ('Aventura', 'Jornadas e explorações'),
                                                 ('Comédia', 'Animes humorísticos'),
                                                 ('Drama', 'Histórias dramáticas'),
                                                 ('Fantasia', 'Elementos fantásticos e mágicos'),
                                                 ('Ficção Científica', 'Tecnologia e futurismo'),
                                                 ('Romance', 'Histórias de amor'),
                                                 ('Slice of Life', 'Cotidiano e vida real'),
                                                 ('Sobrenatural', 'Elementos sobrenaturais'),
                                                 ('Mistério', 'Histórias de mistério e suspense'),
                                                 ('Terror', 'Animes de horror'),
                                                 ('Esportes', 'Competições esportivas'),
                                                 ('Mecha', 'Robôs gigantes'),
                                                 ('Shounen', 'Público jovem masculino'),
                                                 ('Shoujo', 'Público jovem feminino'),
                                                 ('Seinen', 'Público adulto masculino'),
                                                 ('Josei', 'Público adulto feminino'),
                                                 ('Isekai', 'Transportado para outro mundo'),
                                                 ('Escola', 'Ambiente escolar'),
                                                 ('Música', 'Focado em música');

-- Inserir alguns animes de exemplo (triggers gerarão IDs automaticamente)
INSERT INTO animes (titulo_original, titulo_portugues, titulo_ingles, sinopse, data_lancamento, status_anime, numero_episodios, duracao_episodio, classificacao_etaria, estudio, fonte_original) VALUES
                                                                                                                                                                                                     ('Shingeki no Kyojin', 'Attack on Titan', 'Attack on Titan', 'A humanidade vive protegida por muralhas gigantes, defendendo-se de titãs comedores de humanos.', '2013-04-07', 'finalizado', 75, 24, '16', 'Wit Studio', 'Manga'),
                                                                                                                                                                                                     ('Fullmetal Alchemist: Brotherhood', 'Fullmetal Alchemist: Brotherhood', 'Fullmetal Alchemist: Brotherhood', 'Dois irmãos buscam a Pedra Filosofal após um experimento de alquimia fracassado.', '2009-04-05', 'finalizado', 64, 24, '14', 'Bones', 'Manga'),
                                                                                                                                                                                                     ('Kimetsu no Yaiba', 'Demon Slayer', 'Demon Slayer', 'Um jovem se torna caçador de demônios para salvar sua irmã transformada em oni.', '2019-04-06', 'em_exibicao', 26, 24, '16', 'ufotable', 'Manga'),
                                                                                                                                                                                                     ('Steins;Gate', 'Steins;Gate', 'Steins;Gate', 'Um grupo de amigos cria acidentalmente uma máquina do tempo funcional.', '2011-04-06', 'finalizado', 24, 24, '14', 'White Fox', 'Visual Novel'),
                                                                                                                                                                                                     ('Death Note', 'Death Note', 'Death Note', 'Um estudante encontra um caderno que mata qualquer pessoa cujo nome seja escrito nele.', '2006-10-04', 'finalizado', 37, 24, '16', 'Madhouse', 'Manga');

# UTILIZANDO '%' POR CONTA DO DOCKER
CREATE USER IF NOT EXISTS 'anime_app_user'@'%' IDENTIFIED BY 'AnimeList@2025!Secure';

GRANT ALL PRIVILEGES ON anime_list_db.* TO 'anime_app_user'@'%';

FLUSH PRIVILEGES;
