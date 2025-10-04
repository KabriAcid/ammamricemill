-- Setup Account Heads Tables with Sample Data

-- 1. Create/Recreate income_heads table
DROP TABLE IF EXISTS `income_heads`;
CREATE TABLE `income_heads` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert sample income heads
INSERT INTO `income_heads` (`name`, `status`) VALUES
('Sales Revenue', 'active'),
('Service Income', 'active'),
('Commission Income', 'active'),
('Interest Income', 'active'),
('Other Income', 'active');

-- 2. Create/Recreate expense_heads table
DROP TABLE IF EXISTS `expense_heads`;
CREATE TABLE `expense_heads` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert sample expense heads
INSERT INTO `expense_heads` (`name`, `status`) VALUES
('Salary & Wages', 'active'),
('Office Rent', 'active'),
('Utilities', 'active'),
('Transportation', 'active'),
('Office Supplies', 'active'),
('Maintenance', 'active'),
('Marketing', 'active'),
('Other Expenses', 'active');

-- 3. Create/Recreate bank_heads table
DROP TABLE IF EXISTS `bank_heads`;
CREATE TABLE `bank_heads` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `account_number` varchar(50) DEFAULT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `branch` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert sample bank heads
INSERT INTO `bank_heads` (`name`, `account_number`, `bank_name`, `branch`, `status`) VALUES
('Cash in Hand', NULL, 'Cash', NULL, 'active'),
('First Bank Account', '1234567890', 'First Bank', 'Main Branch', 'active'),
('GTBank Account', '0987654321', 'GTBank', 'Main Branch', 'active'),
('UBA Account', '1122334455', 'UBA', 'Main Branch', 'active');

-- 4. Create/Recreate other_heads table
DROP TABLE IF EXISTS `other_heads`;
CREATE TABLE `other_heads` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Insert sample other heads
INSERT INTO `other_heads` (`name`, `status`) VALUES
('Petty Cash', 'active'),
('Advance Payments', 'active'),
('Deposits', 'active'),
('Other Accounts', 'active');

-- Verify all tables
SELECT 'income_heads' as table_name, COUNT(*) as count FROM `income_heads`
UNION ALL
SELECT 'expense_heads' as table_name, COUNT(*) as count FROM `expense_heads`
UNION ALL
SELECT 'bank_heads' as table_name, COUNT(*) as count FROM `bank_heads`
UNION ALL
SELECT 'other_heads' as table_name, COUNT(*) as count FROM `other_heads`;
