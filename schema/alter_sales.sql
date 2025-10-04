-- Add challan_no to sales table
ALTER TABLE `sales` 
ADD COLUMN `challan_no` varchar(50) DEFAULT NULL AFTER `invoice_no`;