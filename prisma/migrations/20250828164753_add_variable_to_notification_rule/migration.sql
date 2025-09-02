/*
  Warnings:

  - Added the required column `ZappyUrl` to the `Account` table without a default value. This is not possible if the table is not empty.
  - Added the required column `kiwifyToken` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Account` ADD COLUMN `ZappyUrl` VARCHAR(191) NOT NULL,
    ADD COLUMN `kiwifyToken` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `Integration` MODIFY `type` VARCHAR(191) NOT NULL;

-- AlterTable
ALTER TABLE `NotificationRule` ADD COLUMN `variables` JSON NULL,
    MODIFY `message` VARCHAR(191) NOT NULL;
