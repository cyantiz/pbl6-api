/*
  Warnings:

  - You are about to drop the column `isActivated` on the `user` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE `user` DROP COLUMN `isActivated`,
    ADD COLUMN `avatarUrl` VARCHAR(191) NULL;
