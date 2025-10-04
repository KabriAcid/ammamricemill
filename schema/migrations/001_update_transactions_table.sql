-- Migration: Update transactions table for V2 functionality
-- Date: 2025-10-04
-- Description: Add party tracking, double-entry, and voucher numbering

-- Add new columns to transactions table
ALTER TABLE `transactions`
ADD COLUMN `voucher_number` VARCHAR(50) NULL AFTER `id`,
ADD COLUMN `party_id` INT(11) NULL AFTER `type`,
ADD COLUMN `from_head_id` INT(11) NOT NULL AFTER `party_id`,
ADD COLUMN `from_head_type` ENUM('income','expense','bank','others') NOT NULL AFTER `from_head_id`,
ADD COLUMN `to_head_id` INT(11) NULL AFTER `from_head_type`,
ADD COLUMN `to_head_type` ENUM('income','expense','bank','others') NULL AFTER `to_head_id`,
ADD COLUMN `created_by` INT(11) NULL AFTER `description`;

-- Update type enum to include more voucher types
ALTER TABLE `transactions`
MODIFY COLUMN `type` ENUM('receive','payment','sales_voucher','purchase_voucher','journal','contra') NOT NULL;

-- Migrate existing data (head_id -> from_head_id, head_type -> from_head_type)
UPDATE `transactions` 
SET `from_head_id` = `head_id`,
    `from_head_type` = `head_type`
WHERE `from_head_id` = 0;

-- Add foreign key constraints
ALTER TABLE `transactions`
ADD CONSTRAINT `fk_transactions_party` 
  FOREIGN KEY (`party_id`) REFERENCES `parties` (`id`) ON DELETE SET NULL,
ADD CONSTRAINT `fk_transactions_created_by` 
  FOREIGN KEY (`created_by`) REFERENCES `users` (`id`) ON DELETE SET NULL;

-- Add indexes for better performance
CREATE INDEX `idx_transactions_voucher_number` ON `transactions` (`voucher_number`);
CREATE INDEX `idx_transactions_party_id` ON `transactions` (`party_id`);
CREATE INDEX `idx_transactions_date` ON `transactions` (`date`);
CREATE INDEX `idx_transactions_type` ON `transactions` (`type`);
CREATE INDEX `idx_transactions_from_head` ON `transactions` (`from_head_id`, `from_head_type`);
CREATE INDEX `idx_transactions_to_head` ON `transactions` (`to_head_id`, `to_head_type`);

-- Create sequence table for auto-generating voucher numbers
CREATE TABLE IF NOT EXISTS `voucher_sequences` (
  `id` INT(11) NOT NULL AUTO_INCREMENT,
  `type` VARCHAR(50) NOT NULL,
  `year` INT(4) NOT NULL,
  `last_number` INT(11) NOT NULL DEFAULT 0,
  `prefix` VARCHAR(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_type_year` (`type`, `year`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Note: After running this migration, you may need to drop the old head_id and head_type columns
-- But keep them temporarily for backward compatibility:
-- ALTER TABLE `transactions` DROP COLUMN `head_id`;
-- ALTER TABLE `transactions` DROP COLUMN `head_type`;
