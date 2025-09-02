/*
  Warnings:

  - Made the column `variables` on table `NotificationRule` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE `NotificationRule` MODIFY `active` BOOLEAN NOT NULL DEFAULT true,
    MODIFY `variables` JSON NOT NULL;
