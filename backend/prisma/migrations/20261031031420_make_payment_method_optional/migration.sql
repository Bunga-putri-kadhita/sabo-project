-- AlterTable
ALTER TABLE `payment` MODIFY `method` ENUM('QRIS', 'TRANSFER', 'CASH') NULL;
