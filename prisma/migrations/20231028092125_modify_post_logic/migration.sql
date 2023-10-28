/*
  Warnings:

  - You are about to drop the column `reason` on the `change_request` table. All the data in the column will be lost.
  - You are about to drop the column `targetStatus` on the `change_request` table. All the data in the column will be lost.
  - Added the required column `body` to the `change_request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `title` to the `change_request` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `change_request` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `change_request` DROP FOREIGN KEY `change_request_postId_fkey`;

-- DropForeignKey
ALTER TABLE `comment` DROP FOREIGN KEY `comment_parentCommentId_fkey`;

-- DropForeignKey
ALTER TABLE `comment` DROP FOREIGN KEY `comment_postId_fkey`;

-- DropForeignKey
ALTER TABLE `comment_vote` DROP FOREIGN KEY `comment_vote_commentId_fkey`;

-- DropForeignKey
ALTER TABLE `comment_vote` DROP FOREIGN KEY `comment_vote_userId_fkey`;

-- DropForeignKey
ALTER TABLE `notification` DROP FOREIGN KEY `notification_userId_fkey`;

-- DropForeignKey
ALTER TABLE `post` DROP FOREIGN KEY `post_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `post` DROP FOREIGN KEY `post_userId_fkey`;

-- DropForeignKey
ALTER TABLE `post_vote` DROP FOREIGN KEY `post_vote_postId_fkey`;

-- DropForeignKey
ALTER TABLE `post_vote` DROP FOREIGN KEY `post_vote_userId_fkey`;

-- DropForeignKey
ALTER TABLE `report` DROP FOREIGN KEY `report_postId_fkey`;

-- DropForeignKey
ALTER TABLE `report` DROP FOREIGN KEY `report_userId_fkey`;

-- DropForeignKey
ALTER TABLE `subcategory` DROP FOREIGN KEY `subcategory_categoryId_fkey`;

-- DropForeignKey
ALTER TABLE `visit` DROP FOREIGN KEY `visit_postId_fkey`;

-- DropForeignKey
ALTER TABLE `visit` DROP FOREIGN KEY `visit_userId_fkey`;

-- AlterTable
ALTER TABLE `change_request` DROP COLUMN `reason`,
    DROP COLUMN `targetStatus`,
    ADD COLUMN `body` VARCHAR(191) NOT NULL,
    ADD COLUMN `title` VARCHAR(191) NOT NULL,
    ADD COLUMN `userId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `post` ADD CONSTRAINT `post_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post` ADD CONSTRAINT `post_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `subcategory` ADD CONSTRAINT `subcategory_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comment` ADD CONSTRAINT `comment_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comment` ADD CONSTRAINT `comment_parentCommentId_fkey` FOREIGN KEY (`parentCommentId`) REFERENCES `comment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visit` ADD CONSTRAINT `visit_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `visit` ADD CONSTRAINT `visit_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notification` ADD CONSTRAINT `notification_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report` ADD CONSTRAINT `report_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `report` ADD CONSTRAINT `report_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_vote` ADD CONSTRAINT `post_vote_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `post_vote` ADD CONSTRAINT `post_vote_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comment_vote` ADD CONSTRAINT `comment_vote_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `comment_vote` ADD CONSTRAINT `comment_vote_commentId_fkey` FOREIGN KEY (`commentId`) REFERENCES `comment`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `change_request` ADD CONSTRAINT `change_request_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `change_request` ADD CONSTRAINT `change_request_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
