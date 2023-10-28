/*
  Warnings:

  - Added the required column `categoryId` to the `change_request` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `change_request` ADD COLUMN `categoryId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `subcategory` ADD COLUMN `change_requestId` INTEGER NULL;

-- AddForeignKey
ALTER TABLE `subcategory` ADD CONSTRAINT `subcategory_change_requestId_fkey` FOREIGN KEY (`change_requestId`) REFERENCES `change_request`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;
