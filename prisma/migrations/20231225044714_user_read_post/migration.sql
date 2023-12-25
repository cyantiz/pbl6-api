-- CreateTable
CREATE TABLE `user_read_post` (
    `userId` INTEGER NOT NULL,
    `postId` INTEGER NOT NULL,
    `progress` INTEGER NOT NULL DEFAULT 0,

    PRIMARY KEY (`userId`, `postId`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `user_read_post` ADD CONSTRAINT `user_read_post_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `user_read_post` ADD CONSTRAINT `user_read_post_postId_fkey` FOREIGN KEY (`postId`) REFERENCES `post`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
