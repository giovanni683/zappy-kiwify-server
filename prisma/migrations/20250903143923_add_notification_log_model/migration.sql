-- AlterTable
ALTER TABLE `NotificationLog` MODIFY `statusEnvio` VARCHAR(191) NOT NULL,
    MODIFY `errorMessage` VARCHAR(191) NULL;
