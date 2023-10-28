/*
  Warnings:

  - Added the required column `message` to the `notification` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `notification` ADD COLUMN `message` VARCHAR(191) NOT NULL;
