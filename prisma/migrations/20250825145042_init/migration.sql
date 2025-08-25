-- AlterTable
ALTER TABLE `NotificationRule` ADD COLUMN `adjustments` JSON NULL,
    MODIFY `message` TEXT NOT NULL;
