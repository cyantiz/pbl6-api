-- AddForeignKey
ALTER TABLE `change_request` ADD CONSTRAINT `change_request_categoryId_fkey` FOREIGN KEY (`categoryId`) REFERENCES `category`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
