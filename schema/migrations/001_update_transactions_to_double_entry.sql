-- Migration: Update transactions table to double-entry accounting system
-- Description: Add from_head and to_head columns for V2 double-entry accounting
-- Date: 2025-10-04

-- Step 1: Add new columns for double-entry accounting
ALTER TABLE `transactions`
  ADD COLUMN `from_head_id` INT(11) NULL AFTER `id`,
  ADD COLUMN `from_head_type` ENUM('income', 'expense', 'bank', 'others') NULL AFTER `from_head_id`,
  ADD COLUMN `to_head_id` INT(11) NULL AFTER `from_head_type`,
  ADD COLUMN `to_head_type` ENUM('income', 'expense', 'bank', 'others') NULL AFTER `to_head_id`,
  ADD COLUMN `voucher_no` VARCHAR(50) NULL AFTER `to_head_type`,
  ADD COLUMN `party_id` INT(11) NULL AFTER `voucher_no`;

-- Step 2: Migrate existing data from old structure to new structure
-- For 'receive' transactions: from_head = source, to_head = current head
UPDATE `transactions` 
SET 
  `to_head_id` = `head_id`,
  `to_head_type` = `head_type`,
  `from_head_id` = NULL,
  `from_head_type` = NULL
WHERE `type` = 'receive';

-- For 'payment' transactions: from_head = current head, to_head = destination
UPDATE `transactions` 
SET 
  `from_head_id` = `head_id`,
  `from_head_type` = `head_type`,
  `to_head_id` = NULL,
  `to_head_type` = NULL
WHERE `type` = 'payment';

-- Step 3: (OPTIONAL) Drop old columns if no longer needed
-- Uncomment these lines only AFTER verifying data migration is successful
-- ALTER TABLE `transactions` DROP COLUMN `head_id`;
-- ALTER TABLE `transactions` DROP COLUMN `head_type`;
-- ALTER TABLE `transactions` DROP COLUMN `type`;

-- Step 4: Add indexes for better query performance
ALTER TABLE `transactions`
  ADD INDEX `idx_from_head` (`from_head_id`, `from_head_type`),
  ADD INDEX `idx_to_head` (`to_head_id`, `to_head_type`),
  ADD INDEX `idx_voucher_no` (`voucher_no`),
  ADD INDEX `idx_party_id` (`party_id`),
  ADD INDEX `idx_status` (`status`),
  ADD INDEX `idx_date` (`date`);
