-- Script de criação das tabelas para o projeto Zappy Kiwify
-- Motor: InnoDB | Charset: utf8mb4 | Collation: utf8mb4_unicode_ci

CREATE TABLE IF NOT EXISTS accounts (
    id CHAR(36) NOT NULL PRIMARY KEY COMMENT 'UUID da conta',
    status INT COMMENT 'Status da conta: 0=Inativa, 1=Ativa',
    name VARCHAR(255) NOT NULL,
    CONSTRAINT uc_accounts_id UNIQUE (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS integrations (
    id CHAR(36) NOT NULL PRIMARY KEY COMMENT 'UUID da integração',
    account_id CHAR(36) NOT NULL,
    type INT COMMENT 'Tipo de integração: 1=KIWIFY',
    credentials JSON COMMENT 'Credenciais da integração',
    INDEX idx_integrations_account_id (account_id),
    CONSTRAINT fk_integrations_account_id FOREIGN KEY (account_id)
        REFERENCES accounts(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS notification_rules (
    id CHAR(36) NOT NULL PRIMARY KEY COMMENT 'UUID da regra de notificação',
    account_id CHAR(36) NOT NULL,
    integration_id CHAR(36) NOT NULL,
    active BOOLEAN DEFAULT TRUE COMMENT 'Indica se a regra está ativa',
    event INT NOT NULL COMMENT 'Código do evento gatilho',
    message TEXT NOT NULL,
    adjustments JSON NULL COMMENT 'Configurações adicionais (ex: setor)',
    INDEX idx_notification_rules_account_id (account_id),
    INDEX idx_notification_rules_integration_id (integration_id),
    CONSTRAINT fk_notification_rules_account_id FOREIGN KEY (account_id)
        REFERENCES accounts(id)
        ON DELETE CASCADE,
    CONSTRAINT fk_notification_rules_integration_id FOREIGN KEY (integration_id)
        REFERENCES integrations(id)
        ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
