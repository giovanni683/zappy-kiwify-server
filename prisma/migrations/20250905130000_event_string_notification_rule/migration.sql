-- Alterar o campo event de Int para String na tabela NotificationRule
ALTER TABLE `NotificationRule` MODIFY COLUMN `event` VARCHAR(191) NOT NULL;
