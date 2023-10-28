/*
  Warnings:

  - You are about to alter the column `status` on the `post` table. The data in that column could be lost. The data in that column will be cast from `Enum(EnumId(3))` to `VarChar(191)`.

*/
-- AlterTable
ALTER TABLE `post` MODIFY `status` VARCHAR(191) NOT NULL DEFAULT 'PENDING';
