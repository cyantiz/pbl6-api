/*
  Warnings:

  - Added the required column `slug` to the `category` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thumbnail` to the `category` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `category` ADD COLUMN `slug` VARCHAR(191) NOT NULL,
    ADD COLUMN `thumbnail` VARCHAR(191) NOT NULL;
