-- Migration: create emptybag_receive table
-- Run this on your development DB to add the emptybag_receive table



-- Optional: add foreign key if you use FK constraints (uncomment to enable)
-- ALTER TABLE `emptybag_receive` ADD CONSTRAINT `fk_receive_party` FOREIGN KEY (`party_id`) REFERENCES `parties` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- Example to copy existing data from emptybag_purchases (optional):
-- INSERT INTO emptybag_receive (date, invoice_no, party_id, items, quantity, price, total_amount, description, created_at)
-- SELECT date, invoice_no, party_id, items, quantity, price, total_amount, description, created_at FROM emptybag_purchases;

-- To rollback (drop the table):
-- DROP TABLE IF EXISTS `emptybag_receive`;
