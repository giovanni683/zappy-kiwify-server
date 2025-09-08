CREATE TABLE IF NOT EXISTS `NotificationLog` (
  `id` VARCHAR(191) NOT NULL,
  `accountId` VARCHAR(191) NOT NULL,
  `eventType` VARCHAR(191) NOT NULL,
  `nomeCliente` VARCHAR(191) NOT NULL,
  `numeroCliente` VARCHAR(191) NOT NULL,
  `statusEnvio` VARCHAR(191) NOT NULL,
  `errorMessage` VARCHAR(191),
  `sentAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  PRIMARY KEY (`id`)
);

-- Remover criação duplicada da tabela NotificationLog
-- AlterTable
ALTER TABLE `NotificationLog` MODIFY `statusEnvio` VARCHAR(191) NOT NULL,
    MODIFY `errorMessage` VARCHAR(191) NULL;