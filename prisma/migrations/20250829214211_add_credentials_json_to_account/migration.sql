/*
  Warnings:

  - You are about to drop the column `ZappyUrl` on the `Account` table. All the data in the column will be lost.
  - You are about to drop the column `kiwifyToken` on the `Account` table. All the data in the column will be lost.
  - Added the required column `credentials` to the `Account` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Account` DROP COLUMN `ZappyUrl`,
    DROP COLUMN `kiwifyToken`,
    ADD COLUMN `credentials` JSON NOT NULL;
