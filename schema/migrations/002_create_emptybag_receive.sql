-- Migration: create emptybag_receive table
-- Run this on your development DB to add the emptybag_receive table

CREATE TABLE IF NOT EXISTS `emptybag_receive` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `date` date NOT NULL,
  `invoice_no` varchar(50) NOT NULL,
  `party_id` int(11) DEFAULT NULL,
  `items` int(11) DEFAULT 0,
  `quantity` decimal(10,2) DEFAULT 0.00,
  `price` decimal(12,2) DEFAULT 0.00,
  `total_amount` decimal(12,2) DEFAULT 0.00,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_party_id` (`party_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Optional: add foreign key if you use FK constraints (uncomment to enable)
-- ALTER TABLE `emptybag_receive` ADD CONSTRAINT `fk_receive_party` FOREIGN KEY (`party_id`) REFERENCES `parties` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Example to copy existing data from emptybag_purchases (optional):
-- INSERT INTO emptybag_receive (date, invoice_no, party_id, items, quantity, price, total_amount, description, created_at)
-- SELECT date, invoice_no, party_id, items, quantity, price, total_amount, description, created_at FROM emptybag_purchases;

-- To rollback (drop the table):
-- DROP TABLE IF EXISTS `emptybag_receive`;
