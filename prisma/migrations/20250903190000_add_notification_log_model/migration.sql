-- CreateTable
CREATE TABLE `NotificationLog` (
    `id` VARCHAR(191) NOT NULL,
    `accountId` VARCHAR(191) NOT NULL,
    `eventType` VARCHAR(191) NOT NULL,
    `nomeCliente` VARCHAR(191) NOT NULL,
    `numeroCliente` VARCHAR(191) NOT NULL,
    `statusEnvio` VARCHAR(20) NOT NULL,
    `errorMessage` TEXT NULL,
    `sentAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
