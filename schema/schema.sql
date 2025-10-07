-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Oct 07, 2025 at 12:55 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ammamricemill`
--

-- --------------------------------------------------------

--
-- Table structure for table `add_stocks`
--

CREATE TABLE `add_stocks` (
  `id` int(11) NOT NULL,
  `date` date NOT NULL,
  `product_id` int(11) NOT NULL,
  `godown_id` int(11) DEFAULT NULL,
  `quantity` decimal(12,2) NOT NULL,
  `net_weight` decimal(12,2) NOT NULL,
  `rate` decimal(10,2) DEFAULT 0.00,
  `total_price` decimal(12,2) DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `attendance`
--

CREATE TABLE `attendance` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `check_in` time DEFAULT NULL,
  `check_out` time DEFAULT NULL,
  `status` enum('present','absent','late','half-day','leave') DEFAULT 'present',
  `working_hours` decimal(4,2) DEFAULT 0.00,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `attendance`
--

INSERT INTO `attendance` (`id`, `employee_id`, `date`, `check_in`, `check_out`, `status`, `working_hours`, `notes`, `created_at`) VALUES
(5, 1, '2025-10-03', '19:45:00', '22:44:00', 'present', 0.00, NULL, '2025-10-03 18:02:19'),
(6, 2, '2025-10-03', '21:43:00', '20:43:00', 'leave', 0.00, NULL, '2025-10-03 18:42:55');

-- --------------------------------------------------------

--
-- Table structure for table `attendance_records`
--

CREATE TABLE `attendance_records` (
  `id` int(11) NOT NULL,
  `date` date NOT NULL,
  `employee_id` int(11) NOT NULL,
  `status` enum('present','absent','leave','inactive') NOT NULL,
  `in_time` time DEFAULT NULL,
  `out_time` time DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `bank_heads`
--

CREATE TABLE `bank_heads` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `account_number` varchar(50) DEFAULT NULL,
  `bank_name` varchar(255) DEFAULT NULL,
  `branch` varchar(255) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `bank_heads`
--

INSERT INTO `bank_heads` (`id`, `name`, `account_number`, `bank_name`, `branch`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Cash in Hand', NULL, 'Cash', NULL, 'inactive', '2025-10-04 08:46:21', '2025-10-04 15:40:33'),
(2, 'First Bank Account', '1234567890', 'First Bank', 'Main Branch', 'inactive', '2025-10-04 08:46:21', '2025-10-04 15:40:33'),
(3, 'GTBank Account', '0987654321', 'GTBank', 'Main Branch', 'active', '2025-10-04 08:46:21', '2025-10-04 08:46:21'),
(4, 'UBA Account', '1122334455', 'UBA', 'Main Branch', 'inactive', '2025-10-04 08:46:21', '2025-10-04 15:40:33'),
(5, 'Beau Cardenas', NULL, NULL, NULL, 'active', '2025-10-05 04:51:50', '2025-10-05 04:51:50');

-- --------------------------------------------------------

--
-- Table structure for table `categories`
--

CREATE TABLE `categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `unit` varchar(50) DEFAULT '',
  `description` text DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `categories`
--

INSERT INTO `categories` (`id`, `name`, `unit`, `description`, `status`, `created_at`) VALUES
(1, 'Raw Paddy', '', 'Unprocessed rice paddy', 'active', '2025-10-02 21:49:11'),
(2, 'Finished Rice', '', 'Polished rice ready for sale', 'active', '2025-10-02 21:49:11'),
(3, 'Byproducts', '', 'Husk, bran, etc.', 'active', '2025-10-02 21:49:11'),
(4, 'Bradley Brooks', 'kg', 'Similique reprehende', 'active', '2025-10-05 13:41:11');

-- --------------------------------------------------------

--
-- Table structure for table `designations`
--

CREATE TABLE `designations` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `designations`
--

INSERT INTO `designations` (`id`, `name`, `description`, `status`, `created_at`) VALUES
(1, 'Manager', 'Supervises operations', 'active', '2025-10-02 21:49:11'),
(2, 'Accountant', 'Handles accounts', 'active', '2025-10-02 21:49:11'),
(3, 'Worker', 'Labor staff', 'active', '2025-10-02 21:49:11'),
(4, 'Vera Pruitt', 'Laboriosam est mini', 'active', '2025-10-04 04:55:49');

-- --------------------------------------------------------

--
-- Table structure for table `employees`
--

CREATE TABLE `employees` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `designation_id` int(11) DEFAULT NULL,
  `salary` decimal(10,2) DEFAULT 0.00,
  `joining_date` date DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employees`
--

INSERT INTO `employees` (`id`, `name`, `email`, `phone`, `designation_id`, `salary`, `joining_date`, `status`, `created_at`) VALUES
(1, 'Drew Quinn', 'qenakegasa@mailinator.com', '09098765434', 2, 86000.00, '2001-08-11', 'active', '2025-10-02 21:49:12'),
(2, 'Musa Bello', 'musa@example.com', '+2347023456789', 3, 50000.00, '2024-03-14', 'inactive', '2025-10-02 21:49:12'),
(4, 'Stephen Mann', 'cotikysy@mailinator.com', '0903454332', 3, 70000.00, '2018-09-08', 'inactive', '2025-10-04 09:47:07'),
(5, 'Ursa Terrell', 'kijacofy@mailinator.com', '09034567864', 1, 65000.00, '1974-03-18', 'active', '2025-10-04 14:58:51');

-- --------------------------------------------------------

--
-- Table structure for table `employee_salary`
--

CREATE TABLE `employee_salary` (
  `id` int(11) NOT NULL,
  `salary_id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `salary` decimal(10,2) DEFAULT 0.00,
  `bonus_ot` decimal(10,2) DEFAULT 0.00,
  `absent_fine` decimal(10,2) DEFAULT 0.00,
  `deduction` decimal(10,2) DEFAULT 0.00,
  `payment` decimal(10,2) DEFAULT 0.00,
  `note` text DEFAULT NULL,
  `signature` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `employee_salary`
--

INSERT INTO `employee_salary` (`id`, `salary_id`, `employee_id`, `salary`, `bonus_ot`, `absent_fine`, `deduction`, `payment`, `note`, `signature`, `created_at`) VALUES
(2, 2, 1, 150000.00, 0.00, 0.00, 0.00, 150000.00, NULL, NULL, '2025-10-03 14:11:46'),
(3, 2, 2, 50000.00, 0.00, 0.00, 0.00, 50000.00, NULL, NULL, '2025-10-03 14:11:46');

-- --------------------------------------------------------

--
-- Table structure for table `emptybag_categories`
--

CREATE TABLE `emptybag_categories` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `emptybag_payments`
--

CREATE TABLE `emptybag_payments` (
  `id` int(11) NOT NULL,
  `date` date NOT NULL,
  `invoice_no` varchar(50) NOT NULL,
  `party_id` int(11) DEFAULT NULL,
  `items` int(11) DEFAULT 0,
  `quantity` decimal(10,2) DEFAULT 0.00,
  `amount` decimal(12,2) DEFAULT 0.00,
  `payment_mode` enum('cash','bank','upi','cheque','other') DEFAULT 'cash',
  `reference_no` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `emptybag_products`
--

CREATE TABLE `emptybag_products` (
  `id` int(11) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `name` varchar(100) NOT NULL,
  `size` varchar(50) DEFAULT NULL,
  `weight` decimal(10,2) DEFAULT NULL,
  `unit` varchar(20) DEFAULT 'pieces',
  `price` decimal(10,2) DEFAULT 0.00,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `emptybag_purchases`
--

CREATE TABLE `emptybag_purchases` (
  `id` int(11) NOT NULL,
  `date` date NOT NULL,
  `invoice_no` varchar(50) NOT NULL,
  `party_id` int(11) DEFAULT NULL,
  `items` int(11) DEFAULT 0,
  `quantity` decimal(10,2) DEFAULT 0.00,
  `price` decimal(10,2) DEFAULT 0.00,
  `total_amount` decimal(12,2) DEFAULT 0.00,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `emptybag_purchases`
--

INSERT INTO `emptybag_purchases` (`id`, `date`, `invoice_no`, `party_id`, `items`, `quantity`, `price`, `total_amount`, `description`, `created_at`) VALUES
(1, '2025-10-05', '33', 2, 1000, 1000.00, 1034000.00, 0.00, '', '2025-10-05 15:43:47'),
(2, '2025-10-11', '400', 2, 9, 57.00, 390000.00, 0.00, 'In voluptatem repud', '2025-10-06 00:20:06');

-- --------------------------------------------------------

--
-- Table structure for table `emptybag_receive`
--

CREATE TABLE `emptybag_receive` (
  `id` int(11) NOT NULL,
  `date` date NOT NULL,
  `invoice_no` varchar(50) NOT NULL,
  `party_id` int(11) DEFAULT NULL,
  `items` int(11) DEFAULT 0,
  `quantity` decimal(10,2) DEFAULT 0.00,
  `price` decimal(12,2) DEFAULT 0.00,
  `total_amount` decimal(12,2) DEFAULT 0.00,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `emptybag_receive`
--

INSERT INTO `emptybag_receive` (`id`, `date`, `invoice_no`, `party_id`, `items`, `quantity`, `price`, `total_amount`, `description`, `created_at`) VALUES
(1, '2025-10-18', '507', 1, 81, 78.00, 370000.00, 28860000.00, 'Sint aspernatur in a', '2025-10-06 01:00:57');

-- --------------------------------------------------------

--
-- Table structure for table `emptybag_sales`
--

CREATE TABLE `emptybag_sales` (
  `id` int(11) NOT NULL,
  `date` date NOT NULL,
  `invoice_no` varchar(50) NOT NULL,
  `party_id` int(11) DEFAULT NULL,
  `items` int(11) DEFAULT 0,
  `quantity` decimal(10,2) DEFAULT 0.00,
  `price` decimal(10,2) DEFAULT 0.00,
  `total_amount` decimal(12,2) DEFAULT 0.00,
  `description` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `expense_heads`
--

CREATE TABLE `expense_heads` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `expense_heads`
--

INSERT INTO `expense_heads` (`id`, `name`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Salary & Wages', 'inactive', '2025-10-04 08:46:21', '2025-10-04 15:40:23'),
(2, 'Office Rent', 'inactive', '2025-10-04 08:46:21', '2025-10-04 15:40:23'),
(3, 'Utilities', 'inactive', '2025-10-04 08:46:21', '2025-10-04 15:40:23'),
(4, 'Transportation', 'inactive', '2025-10-04 08:46:21', '2025-10-04 15:40:23'),
(5, 'Office Supplies', 'inactive', '2025-10-04 08:46:21', '2025-10-04 15:40:23'),
(6, 'Maintenance', 'inactive', '2025-10-04 08:46:21', '2025-10-04 15:40:23'),
(7, 'Marketing', 'inactive', '2025-10-04 08:46:21', '2025-10-04 15:40:23'),
(8, 'Other Expenses', 'inactive', '2025-10-04 08:46:21', '2025-10-04 15:40:23'),
(9, 'Anthony Cash', 'inactive', '2025-10-04 15:26:04', '2025-10-04 15:40:23'),
(10, 'Moose', 'active', '2025-10-05 04:51:21', '2025-10-05 12:16:07');

-- --------------------------------------------------------

--
-- Table structure for table `financial_years`
--

CREATE TABLE `financial_years` (
  `id` int(11) NOT NULL,
  `name` varchar(20) NOT NULL,
  `start_date` date NOT NULL,
  `end_date` date NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `godowns`
--

CREATE TABLE `godowns` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `capacity` decimal(12,2) NOT NULL,
  `current_stock` decimal(12,2) DEFAULT 0.00,
  `unit` varchar(20) NOT NULL,
  `location` varchar(100) DEFAULT NULL,
  `manager` varchar(100) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `godowns`
--

INSERT INTO `godowns` (`id`, `name`, `capacity`, `current_stock`, `unit`, `location`, `manager`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Godown 1', 5000.00, 0.00, 'bags', 'Central Store', 'Abdullahi Musa', NULL, 'active', '2025-10-02 21:49:11', '2025-10-03 01:00:58'),
(4, 'Main Godown', 10000.00, 0.00, '', 'Warehouse A', NULL, NULL, 'active', '2025-10-05 22:52:57', '2025-10-05 22:52:57'),
(5, 'Secondary Godown', 5000.00, 0.00, '', 'Warehouse B', NULL, NULL, 'active', '2025-10-05 22:52:57', '2025-10-05 22:52:57');

-- --------------------------------------------------------

--
-- Table structure for table `income_heads`
--

CREATE TABLE `income_heads` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `receive` decimal(10,2) NOT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `income_heads`
--

INSERT INTO `income_heads` (`id`, `name`, `status`, `receive`, `created_at`, `updated_at`) VALUES
(1, 'Sales Revenue', 'active', 0.00, '2025-10-04 08:46:19', '2025-10-04 08:46:19'),
(2, 'Service Income', 'inactive', 0.00, '2025-10-04 08:46:19', '2025-10-04 15:40:08'),
(3, 'Commission Income', 'inactive', 0.00, '2025-10-04 08:46:19', '2025-10-04 15:40:08'),
(4, 'Interest Income', 'inactive', 0.00, '2025-10-04 08:46:19', '2025-10-04 15:40:08'),
(5, 'Other Income', 'inactive', 0.00, '2025-10-04 08:46:19', '2025-10-04 15:40:08'),
(6, 'Hilda Blanchard', 'inactive', 0.00, '2025-10-04 15:27:43', '2025-10-04 15:40:08'),
(7, 'Vera Workman', 'inactive', 0.00, '2025-10-04 15:28:10', '2025-10-04 15:40:08'),
(8, 'Popper', 'active', 0.00, '2025-10-05 04:51:03', '2025-10-05 12:15:05'),
(9, 'Hola', 'active', 0.00, '2025-10-05 10:34:51', '2025-10-05 10:34:51');

-- --------------------------------------------------------

--
-- Table structure for table `monthly_salary`
--

CREATE TABLE `monthly_salary` (
  `id` int(11) NOT NULL,
  `date` date NOT NULL,
  `year` varchar(4) NOT NULL,
  `month` varchar(2) NOT NULL,
  `description` text DEFAULT NULL,
  `total_employees` int(11) DEFAULT 0,
  `total_salary` decimal(12,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `monthly_salary`
--

INSERT INTO `monthly_salary` (`id`, `date`, `year`, `month`, `description`, `total_employees`, `total_salary`, `created_at`, `updated_at`) VALUES
(1, '2025-10-09', '2025', '06', 'March salary', 0, 0.00, '2025-10-03 14:09:45', '2025-10-04 15:15:15'),
(2, '2025-10-16', '2025', '03', 'March salary', 3, 25.00, '2025-10-03 14:11:45', '2025-10-03 14:11:45');

-- --------------------------------------------------------

--
-- Table structure for table `other_heads`
--

CREATE TABLE `other_heads` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `other_heads`
--

INSERT INTO `other_heads` (`id`, `name`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Petty Cash', 'active', '2025-10-04 08:46:23', '2025-10-04 08:46:23'),
(2, 'Advance Payments', 'active', '2025-10-04 08:46:23', '2025-10-04 08:46:23'),
(3, 'Deposits', 'active', '2025-10-04 08:46:23', '2025-10-04 08:46:23'),
(4, 'Other Accounts', 'active', '2025-10-04 08:46:23', '2025-10-04 08:46:23');

-- --------------------------------------------------------

--
-- Table structure for table `parties`
--

CREATE TABLE `parties` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `type_id` int(11) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `balance` decimal(12,2) DEFAULT 0.00,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `parties`
--

INSERT INTO `parties` (`id`, `name`, `type_id`, `phone`, `address`, `balance`, `status`, `created_at`) VALUES
(1, 'Dangote Farms', NULL, '+2347034567890', 'Kano, Nigeria', 0.00, 'active', '2025-10-02 21:49:12'),
(2, 'Alhaji Sani Traders', NULL, '+2347045678901', 'Kaduna, Nigeria', 50000.00, 'active', '2025-10-02 21:49:12'),
(13, 'Dangote Farms', 6, '+2347034567890', 'Kano, Nigeria', 0.00, 'active', '2025-10-02 20:49:12'),
(14, 'Alhaji Sani Traders', 7, '+2347045678901', 'Kaduna, Nigeria', 50000.00, 'active', '2025-10-02 20:49:12'),
(15, 'New Supplier Ltd', 6, '+2347011122334', 'Lagos, Nigeria', 0.00, 'active', '2025-10-07 10:46:04'),
(16, 'Retail Customer', 7, '+2347012233445', 'Abuja, Nigeria', 0.00, 'active', '2025-10-07 10:46:04');

-- --------------------------------------------------------

--
-- Table structure for table `party_due`
--

CREATE TABLE `party_due` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `company` varchar(255) DEFAULT NULL,
  `mobile` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `due` decimal(12,2) NOT NULL DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `party_types`
--

CREATE TABLE `party_types` (
  `id` int(11) NOT NULL,
  `name` varchar(50) NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT NULL ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `party_types`
--

INSERT INTO `party_types` (`id`, `name`, `description`, `status`, `created_at`, `updated_at`) VALUES
(5, 'Katell Randolph', 'Aut vero modi at vol', 'active', '2025-10-05 11:49:59', NULL),
(6, 'Supplier', 'Suppliers providing raw paddy', 'active', '2025-10-07 10:46:04', NULL),
(7, 'Customer', 'Customers buying rice products', 'active', '2025-10-07 10:46:04', NULL),
(8, 'Broker', 'Agents handling deals', 'active', '2025-10-07 10:46:04', NULL);

-- --------------------------------------------------------

--
-- Table structure for table `productions`
--

CREATE TABLE `productions` (
  `id` int(11) NOT NULL,
  `date` date NOT NULL,
  `invoice_no` varchar(50) NOT NULL,
  `order_no` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `total_quantity` decimal(12,2) DEFAULT 0.00,
  `total_weight` decimal(12,2) DEFAULT 0.00,
  `start_time` datetime DEFAULT NULL,
  `end_time` datetime DEFAULT NULL,
  `labor_cost` decimal(10,2) DEFAULT 0.00,
  `electricity_cost` decimal(10,2) DEFAULT 0.00,
  `other_costs` decimal(10,2) DEFAULT 0.00,
  `total_cost` decimal(12,2) DEFAULT 0.00,
  `status` enum('draft','in-progress','completed','cancelled') DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `production_details`
--

CREATE TABLE `production_details` (
  `id` int(11) NOT NULL,
  `production_id` int(11) NOT NULL,
  `date` date NOT NULL,
  `quantity_produced` int(11) NOT NULL DEFAULT 0,
  `weight_produced` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` enum('pending','completed','cancelled') DEFAULT 'pending',
  `notes` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `production_items`
--

CREATE TABLE `production_items` (
  `id` int(11) NOT NULL,
  `production_id` int(11) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `product_id` int(11) NOT NULL,
  `godown_id` int(11) DEFAULT NULL,
  `silo_id` int(11) DEFAULT NULL,
  `quantity` decimal(12,2) DEFAULT 0.00,
  `net_weight` decimal(12,2) DEFAULT 0.00,
  `item_type` enum('input','output','byproduct') DEFAULT 'input',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `production_orders`
--

CREATE TABLE `production_orders` (
  `id` int(11) NOT NULL,
  `invoice_no` varchar(50) NOT NULL,
  `date` date NOT NULL,
  `description` text DEFAULT NULL,
  `total_quantity` int(11) NOT NULL DEFAULT 0,
  `total_weight` decimal(10,2) NOT NULL DEFAULT 0.00,
  `status` enum('active','completed','cancelled') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `production_stocks`
--

CREATE TABLE `production_stocks` (
  `id` int(11) NOT NULL,
  `date` date NOT NULL,
  `invoice_no` varchar(50) NOT NULL,
  `production_id` int(11) DEFAULT NULL,
  `production_no` varchar(50) DEFAULT NULL,
  `description` text DEFAULT NULL,
  `total_quantity` decimal(12,2) DEFAULT 0.00,
  `total_net_weight` decimal(12,2) DEFAULT 0.00,
  `status` enum('draft','completed') DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `production_stock_items`
--

CREATE TABLE `production_stock_items` (
  `id` int(11) NOT NULL,
  `production_stock_id` int(11) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `product_id` int(11) NOT NULL,
  `size` varchar(50) DEFAULT NULL,
  `weight` varchar(50) DEFAULT NULL,
  `godown_id` int(11) DEFAULT NULL,
  `quantity` decimal(12,2) DEFAULT 0.00,
  `net_weight` decimal(12,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `products`
--

CREATE TABLE `products` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `unit` varchar(20) NOT NULL,
  `price` decimal(10,2) DEFAULT 0.00,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `products`
--

INSERT INTO `products` (`id`, `name`, `category_id`, `unit`, `price`, `status`, `created_at`) VALUES
(1, 'Paddy Rice', 1, 'kg', 250.00, 'inactive', '2025-10-02 21:49:11'),
(2, 'White Rice', 2, 'kg', 750.00, 'inactive', '2025-10-02 21:49:11'),
(3, 'Rice Husk', 3, 'kg', 50.00, 'inactive', '2025-10-02 21:49:11'),
(4, 'Nehru Morgan', 2, 'bag', 5000.00, 'active', '2025-10-05 14:53:47');

-- --------------------------------------------------------

--
-- Table structure for table `purchases`
--

CREATE TABLE `purchases` (
  `id` int(11) NOT NULL,
  `date` date NOT NULL,
  `invoice_no` varchar(50) NOT NULL,
  `challan_no` varchar(50) DEFAULT NULL,
  `party_id` int(11) DEFAULT NULL,
  `transport_info` text DEFAULT NULL,
  `broker_id` int(11) DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `total_quantity` decimal(12,2) DEFAULT 0.00,
  `total_net_weight` decimal(12,2) DEFAULT 0.00,
  `invoice_amount` decimal(12,2) DEFAULT 0.00,
  `discount` decimal(12,2) DEFAULT 0.00,
  `total_amount` decimal(12,2) DEFAULT 0.00,
  `previous_balance` decimal(12,2) DEFAULT 0.00,
  `net_payable` decimal(12,2) DEFAULT 0.00,
  `paid_amount` decimal(12,2) DEFAULT 0.00,
  `current_balance` decimal(12,2) DEFAULT 0.00,
  `payment_mode` enum('cash','bank','upi','cheque','other') DEFAULT 'cash',
  `reference_no` varchar(50) DEFAULT NULL,
  `status` enum('draft','pending','completed','cancelled') DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `purchase_items`
--

CREATE TABLE `purchase_items` (
  `id` int(11) NOT NULL,
  `purchase_id` int(11) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `product_id` int(11) NOT NULL,
  `godown_id` int(11) DEFAULT NULL,
  `quantity` decimal(12,2) DEFAULT 0.00,
  `net_weight` decimal(12,2) DEFAULT 0.00,
  `rate` decimal(10,2) DEFAULT 0.00,
  `total_price` decimal(12,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `salary`
--

CREATE TABLE `salary` (
  `id` int(11) NOT NULL,
  `employee_id` int(11) NOT NULL,
  `month` varchar(7) NOT NULL,
  `basic_salary` decimal(10,2) NOT NULL,
  `allowances` decimal(10,2) DEFAULT 0.00,
  `deductions` decimal(10,2) DEFAULT 0.00,
  `net_salary` decimal(10,2) NOT NULL,
  `status` enum('draft','pending','paid') DEFAULT 'draft',
  `paid_date` date DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales`
--

CREATE TABLE `sales` (
  `id` int(11) NOT NULL,
  `date` date NOT NULL,
  `invoice_no` varchar(50) NOT NULL,
  `challan_no` varchar(50) DEFAULT NULL,
  `party_id` int(11) DEFAULT NULL,
  `transport_info` text DEFAULT NULL,
  `notes` text DEFAULT NULL,
  `total_quantity` decimal(12,2) DEFAULT 0.00,
  `total_net_weight` decimal(12,2) DEFAULT 0.00,
  `invoice_amount` decimal(12,2) DEFAULT 0.00,
  `discount` decimal(12,2) DEFAULT 0.00,
  `total_amount` decimal(12,2) DEFAULT 0.00,
  `previous_balance` decimal(12,2) DEFAULT 0.00,
  `net_receivable` decimal(12,2) DEFAULT 0.00,
  `received_amount` decimal(12,2) DEFAULT 0.00,
  `current_balance` decimal(12,2) DEFAULT 0.00,
  `payment_mode` enum('cash','bank','upi','cheque','other') DEFAULT 'cash',
  `reference_no` varchar(50) DEFAULT NULL,
  `status` enum('draft','pending','delivered','cancelled') DEFAULT 'draft',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sales_items`
--

CREATE TABLE `sales_items` (
  `id` int(11) NOT NULL,
  `sales_id` int(11) NOT NULL,
  `category_id` int(11) DEFAULT NULL,
  `product_id` int(11) NOT NULL,
  `godown_id` int(11) DEFAULT NULL,
  `quantity` decimal(12,2) DEFAULT 0.00,
  `net_weight` decimal(12,2) DEFAULT 0.00,
  `rate` decimal(10,2) DEFAULT 0.00,
  `total_price` decimal(12,2) DEFAULT 0.00,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `settings`
--

CREATE TABLE `settings` (
  `id` int(11) NOT NULL,
  `company_name` varchar(255) NOT NULL,
  `address` text DEFAULT NULL,
  `phone` varchar(50) NOT NULL,
  `email` varchar(255) NOT NULL,
  `tax_rate` decimal(10,2) DEFAULT 0.00,
  `currency` varchar(10) DEFAULT 'NGN',
  `timezone` varchar(50) DEFAULT 'Africa/Lagos',
  `date_format` varchar(20) DEFAULT 'DD/MM/YYYY',
  `logo_url` varchar(255) DEFAULT NULL,
  `favicon_url` varchar(255) DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `settings`
--

INSERT INTO `settings` (`id`, `company_name`, `address`, `phone`, `email`, `tax_rate`, `currency`, `timezone`, `date_format`, `logo_url`, `favicon_url`, `created_at`, `updated_at`) VALUES
(1, 'AMMAM RICE MILL LTD', 'Sokoto', '09023456787', 'guwyk@mailinator.com', 100.00, NULL, NULL, NULL, NULL, NULL, '2025-10-03 00:18:16', '2025-10-03 00:29:25');

-- --------------------------------------------------------

--
-- Table structure for table `silos`
--

CREATE TABLE `silos` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `capacity` decimal(12,2) NOT NULL,
  `description` text NOT NULL,
  `current_stock` decimal(12,2) DEFAULT 0.00,
  `unit` varchar(20) NOT NULL,
  `location` varchar(100) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `silos`
--

INSERT INTO `silos` (`id`, `name`, `capacity`, `description`, `current_stock`, `unit`, `location`, `status`, `created_at`, `updated_at`) VALUES
(1, 'Silo A', 1000.00, 'This is another silo', 0.00, 'kg', 'Factory North Wing', 'active', '2025-10-02 21:49:11', '2025-10-03 00:46:12'),
(2, 'Silo B', 15000.00, '', 0.00, 'kg', 'Factory South Wing', 'active', '2025-10-02 21:49:11', '2025-10-03 00:44:42'),
(4, 'Silo C', 5.00, 'This is the best silo so far', 0.00, '', NULL, 'active', '2025-10-03 00:45:49', '2025-10-03 00:45:49');

-- --------------------------------------------------------

--
-- Table structure for table `sms_logs`
--

CREATE TABLE `sms_logs` (
  `id` int(11) NOT NULL,
  `template_id` int(11) DEFAULT NULL,
  `recipient` varchar(20) NOT NULL,
  `content` text NOT NULL,
  `status` enum('pending','sent','failed') DEFAULT 'pending',
  `error_message` text DEFAULT NULL,
  `sent_at` timestamp NULL DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `sms_templates`
--

CREATE TABLE `sms_templates` (
  `id` int(11) NOT NULL,
  `name` varchar(100) NOT NULL,
  `content` text NOT NULL,
  `variables` text DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `stocks`
--

CREATE TABLE `stocks` (
  `id` int(11) NOT NULL,
  `product_id` int(11) NOT NULL,
  `godown_id` int(11) DEFAULT NULL,
  `opening_stock` decimal(15,2) DEFAULT 0.00,
  `stock_added` decimal(15,2) DEFAULT 0.00,
  `purchase_stock` decimal(15,2) DEFAULT 0.00,
  `sales_stock` decimal(15,2) DEFAULT 0.00,
  `production_stock` decimal(15,2) DEFAULT 0.00,
  `production_used_stock` decimal(15,2) DEFAULT 0.00,
  `current_stock` decimal(15,2) DEFAULT 0.00,
  `avg_price` decimal(15,2) DEFAULT 0.00,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stocks`
--

INSERT INTO `stocks` (`id`, `product_id`, `godown_id`, `opening_stock`, `stock_added`, `purchase_stock`, `sales_stock`, `production_stock`, `production_used_stock`, `current_stock`, `avg_price`, `status`, `created_at`, `updated_at`) VALUES
(13, 1, 1, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 0.00, 'active', '2025-10-07 10:47:07', '2025-10-07 10:47:07');

-- --------------------------------------------------------

--
-- Table structure for table `stock_movements`
--

CREATE TABLE `stock_movements` (
  `id` int(11) NOT NULL,
  `date` date NOT NULL,
  `product_id` int(11) NOT NULL,
  `godown_id` int(11) DEFAULT NULL,
  `movement_type` enum('opening','purchase','production-in','production-out','sales','transfer','adjustment','add') NOT NULL,
  `reference_type` varchar(50) DEFAULT NULL,
  `reference_id` int(11) DEFAULT NULL,
  `quantity_in` decimal(12,2) DEFAULT 0.00,
  `quantity_out` decimal(12,2) DEFAULT 0.00,
  `balance` decimal(12,2) DEFAULT 0.00,
  `rate` decimal(10,2) DEFAULT 0.00,
  `remarks` text DEFAULT NULL,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `transactions`
--

CREATE TABLE `transactions` (
  `id` int(11) NOT NULL,
  `from_head_id` int(11) DEFAULT NULL,
  `from_head_type` enum('income','expense','bank','others') DEFAULT NULL,
  `to_head_id` int(11) DEFAULT NULL,
  `to_head_type` enum('income','expense','bank','others') DEFAULT NULL,
  `voucher_no` varchar(50) DEFAULT NULL,
  `party_id` int(11) DEFAULT NULL,
  `amount` decimal(10,2) NOT NULL,
  `date` date NOT NULL,
  `description` text DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `transactions`
--

INSERT INTO `transactions` (`id`, `from_head_id`, `from_head_type`, `to_head_id`, `to_head_type`, `voucher_no`, `party_id`, `amount`, `date`, `description`, `status`, `created_at`, `updated_at`) VALUES
(1, NULL, NULL, 1, 'income', NULL, NULL, 10000.00, '2025-10-04', 'Opening balance', 'active', '2025-10-04 15:39:31', '2025-10-04 15:39:31'),
(2, 2, 'expense', NULL, NULL, NULL, NULL, 5000.00, '2025-10-04', 'Initial expense', 'active', '2025-10-04 15:39:32', '2025-10-04 15:39:32'),
(3, 3, 'bank', 4, 'others', NULL, NULL, 2000.00, '2025-10-04', 'Bank to others transfer', 'active', '2025-10-04 15:39:32', '2025-10-04 15:39:32'),
(4, NULL, NULL, 8, 'income', NULL, NULL, 62000.00, '2025-10-05', 'Opening balance', 'active', '2025-10-05 04:51:04', '2025-10-05 04:51:04'),
(5, NULL, NULL, 10, 'expense', NULL, NULL, 0.00, '2025-10-05', 'Opening payment', 'active', '2025-10-05 04:51:21', '2025-10-05 04:51:21'),
(6, NULL, NULL, 5, 'bank', NULL, NULL, 0.00, '2025-10-05', 'Opening balance', 'active', '2025-10-05 04:51:50', '2025-10-05 04:51:50'),
(7, NULL, NULL, 9, 'income', NULL, NULL, 5000.00, '2025-10-05', 'Opening balance', 'active', '2025-10-05 10:34:51', '2025-10-05 10:34:51');

-- --------------------------------------------------------

--
-- Table structure for table `transactions_backup`
--

CREATE TABLE `transactions_backup` (
  `id` int(11) NOT NULL DEFAULT 0,
  `voucher_number` varchar(50) DEFAULT NULL,
  `date` date NOT NULL,
  `type` enum('receive','payment','sales_voucher','purchase_voucher','journal','contra') NOT NULL,
  `party_id` int(11) DEFAULT NULL,
  `from_head_id` int(11) NOT NULL,
  `from_head_type` enum('income','expense','bank','others') NOT NULL,
  `to_head_id` int(11) DEFAULT NULL,
  `to_head_type` enum('income','expense','bank','others') DEFAULT NULL,
  `amount` decimal(12,2) NOT NULL,
  `description` text DEFAULT NULL,
  `created_by` int(11) DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users`
--

CREATE TABLE `users` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `role` enum('admin','manager','user') DEFAULT 'user',
  `phone` varchar(20) DEFAULT NULL,
  `address` text DEFAULT NULL,
  `status` enum('active','inactive') DEFAULT 'active',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `users`
--

INSERT INTO `users` (`id`, `name`, `email`, `password_hash`, `role`, `phone`, `address`, `status`, `created_at`, `updated_at`) VALUES
(2, '', 'kabriacid01@gmail.com', '$argon2id$v=19$m=65536,t=3,p=4$xd0JkgHNe1Ibx+TGLurm/w$2XoefrEz/REFEu7XXSKMYD4aTMqpGJNk1dZuHB62R4U', 'user', NULL, NULL, 'active', '2025-10-02 22:54:39', '2025-10-02 22:54:39'),
(3, '', 'admin@ammamricemill.com', '$argon2id$v=19$m=65536,t=3,p=4$rGJgERoC4tvRFwGZbGKV/w$UcWSOq5Zg5q+TZMFkwkWFFqJtaUWeQ53eSgGgBByAdU', 'user', NULL, NULL, 'active', '2025-10-02 22:55:13', '2025-10-02 22:55:13');

-- --------------------------------------------------------

--
-- Table structure for table `voucher_sequences`
--

CREATE TABLE `voucher_sequences` (
  `id` int(11) NOT NULL,
  `type` varchar(50) NOT NULL,
  `year` int(4) NOT NULL,
  `last_number` int(11) NOT NULL DEFAULT 0,
  `prefix` varchar(20) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Indexes for dumped tables
--

--
-- Indexes for table `add_stocks`
--
ALTER TABLE `add_stocks`
  ADD PRIMARY KEY (`id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `godown_id` (`godown_id`);

--
-- Indexes for table `attendance`
--
ALTER TABLE `attendance`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_employee_date` (`employee_id`,`date`);

--
-- Indexes for table `attendance_records`
--
ALTER TABLE `attendance_records`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_attendance_date` (`date`),
  ADD KEY `idx_attendance_employee` (`employee_id`);

--
-- Indexes for table `bank_heads`
--
ALTER TABLE `bank_heads`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `categories`
--
ALTER TABLE `categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `designations`
--
ALTER TABLE `designations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `employees`
--
ALTER TABLE `employees`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`),
  ADD KEY `designation_id` (`designation_id`);

--
-- Indexes for table `employee_salary`
--
ALTER TABLE `employee_salary`
  ADD PRIMARY KEY (`id`),
  ADD KEY `salary_id` (`salary_id`),
  ADD KEY `employee_id` (`employee_id`);

--
-- Indexes for table `emptybag_categories`
--
ALTER TABLE `emptybag_categories`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `emptybag_payments`
--
ALTER TABLE `emptybag_payments`
  ADD PRIMARY KEY (`id`),
  ADD KEY `party_id` (`party_id`);

--
-- Indexes for table `emptybag_products`
--
ALTER TABLE `emptybag_products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `emptybag_purchases`
--
ALTER TABLE `emptybag_purchases`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoice_no` (`invoice_no`),
  ADD KEY `party_id` (`party_id`);

--
-- Indexes for table `emptybag_receive`
--
ALTER TABLE `emptybag_receive`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_party_id` (`party_id`);

--
-- Indexes for table `emptybag_sales`
--
ALTER TABLE `emptybag_sales`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoice_no` (`invoice_no`),
  ADD KEY `party_id` (`party_id`);

--
-- Indexes for table `expense_heads`
--
ALTER TABLE `expense_heads`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `financial_years`
--
ALTER TABLE `financial_years`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `godowns`
--
ALTER TABLE `godowns`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `income_heads`
--
ALTER TABLE `income_heads`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `monthly_salary`
--
ALTER TABLE `monthly_salary`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `other_heads`
--
ALTER TABLE `other_heads`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `parties`
--
ALTER TABLE `parties`
  ADD PRIMARY KEY (`id`),
  ADD KEY `type_id` (`type_id`);

--
-- Indexes for table `party_due`
--
ALTER TABLE `party_due`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `party_types`
--
ALTER TABLE `party_types`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `productions`
--
ALTER TABLE `productions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoice_no` (`invoice_no`);

--
-- Indexes for table `production_details`
--
ALTER TABLE `production_details`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_production` (`production_id`),
  ADD KEY `idx_date` (`date`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `production_items`
--
ALTER TABLE `production_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `production_id` (`production_id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `godown_id` (`godown_id`),
  ADD KEY `silo_id` (`silo_id`);

--
-- Indexes for table `production_orders`
--
ALTER TABLE `production_orders`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoice_no` (`invoice_no`),
  ADD KEY `idx_date` (`date`),
  ADD KEY `idx_invoice` (`invoice_no`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `production_stocks`
--
ALTER TABLE `production_stocks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoice_no` (`invoice_no`),
  ADD KEY `production_id` (`production_id`);

--
-- Indexes for table `production_stock_items`
--
ALTER TABLE `production_stock_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `production_stock_id` (`production_stock_id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `godown_id` (`godown_id`);

--
-- Indexes for table `products`
--
ALTER TABLE `products`
  ADD PRIMARY KEY (`id`),
  ADD KEY `category_id` (`category_id`);

--
-- Indexes for table `purchases`
--
ALTER TABLE `purchases`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoice_no` (`invoice_no`),
  ADD KEY `party_id` (`party_id`),
  ADD KEY `broker_id` (`broker_id`);

--
-- Indexes for table `purchase_items`
--
ALTER TABLE `purchase_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `purchase_id` (`purchase_id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `godown_id` (`godown_id`);

--
-- Indexes for table `salary`
--
ALTER TABLE `salary`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_employee_month` (`employee_id`,`month`);

--
-- Indexes for table `sales`
--
ALTER TABLE `sales`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `invoice_no` (`invoice_no`),
  ADD KEY `party_id` (`party_id`);

--
-- Indexes for table `sales_items`
--
ALTER TABLE `sales_items`
  ADD PRIMARY KEY (`id`),
  ADD KEY `sales_id` (`sales_id`),
  ADD KEY `category_id` (`category_id`),
  ADD KEY `product_id` (`product_id`),
  ADD KEY `godown_id` (`godown_id`);

--
-- Indexes for table `settings`
--
ALTER TABLE `settings`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `silos`
--
ALTER TABLE `silos`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `sms_logs`
--
ALTER TABLE `sms_logs`
  ADD PRIMARY KEY (`id`),
  ADD KEY `template_id` (`template_id`);

--
-- Indexes for table `sms_templates`
--
ALTER TABLE `sms_templates`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `stocks`
--
ALTER TABLE `stocks`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `idx_product_godown` (`product_id`,`godown_id`),
  ADD KEY `idx_product` (`product_id`),
  ADD KEY `idx_godown` (`godown_id`),
  ADD KEY `idx_status` (`status`);

--
-- Indexes for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD PRIMARY KEY (`id`),
  ADD KEY `godown_id` (`godown_id`),
  ADD KEY `idx_date` (`date`),
  ADD KEY `idx_product` (`product_id`),
  ADD KEY `idx_movement_type` (`movement_type`);

--
-- Indexes for table `transactions`
--
ALTER TABLE `transactions`
  ADD PRIMARY KEY (`id`),
  ADD KEY `idx_from_head` (`from_head_id`,`from_head_type`),
  ADD KEY `idx_to_head` (`to_head_id`,`to_head_type`),
  ADD KEY `idx_voucher_no` (`voucher_no`),
  ADD KEY `idx_party_id` (`party_id`),
  ADD KEY `idx_status` (`status`),
  ADD KEY `idx_date` (`date`);

--
-- Indexes for table `users`
--
ALTER TABLE `users`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indexes for table `voucher_sequences`
--
ALTER TABLE `voucher_sequences`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `unique_type_year` (`type`,`year`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `add_stocks`
--
ALTER TABLE `add_stocks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `attendance`
--
ALTER TABLE `attendance`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `attendance_records`
--
ALTER TABLE `attendance_records`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `bank_heads`
--
ALTER TABLE `bank_heads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `categories`
--
ALTER TABLE `categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `designations`
--
ALTER TABLE `designations`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `employees`
--
ALTER TABLE `employees`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `employee_salary`
--
ALTER TABLE `employee_salary`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `emptybag_categories`
--
ALTER TABLE `emptybag_categories`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `emptybag_payments`
--
ALTER TABLE `emptybag_payments`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `emptybag_products`
--
ALTER TABLE `emptybag_products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `emptybag_purchases`
--
ALTER TABLE `emptybag_purchases`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `emptybag_receive`
--
ALTER TABLE `emptybag_receive`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `emptybag_sales`
--
ALTER TABLE `emptybag_sales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `expense_heads`
--
ALTER TABLE `expense_heads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=11;

--
-- AUTO_INCREMENT for table `financial_years`
--
ALTER TABLE `financial_years`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `godowns`
--
ALTER TABLE `godowns`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=6;

--
-- AUTO_INCREMENT for table `income_heads`
--
ALTER TABLE `income_heads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `monthly_salary`
--
ALTER TABLE `monthly_salary`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `other_heads`
--
ALTER TABLE `other_heads`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `parties`
--
ALTER TABLE `parties`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=17;

--
-- AUTO_INCREMENT for table `party_due`
--
ALTER TABLE `party_due`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `party_types`
--
ALTER TABLE `party_types`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=9;

--
-- AUTO_INCREMENT for table `productions`
--
ALTER TABLE `productions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `production_details`
--
ALTER TABLE `production_details`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `production_items`
--
ALTER TABLE `production_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `production_orders`
--
ALTER TABLE `production_orders`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `production_stocks`
--
ALTER TABLE `production_stocks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `production_stock_items`
--
ALTER TABLE `production_stock_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `products`
--
ALTER TABLE `products`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `purchases`
--
ALTER TABLE `purchases`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `purchase_items`
--
ALTER TABLE `purchase_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `salary`
--
ALTER TABLE `salary`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sales`
--
ALTER TABLE `sales`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sales_items`
--
ALTER TABLE `sales_items`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `settings`
--
ALTER TABLE `settings`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `silos`
--
ALTER TABLE `silos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT for table `sms_logs`
--
ALTER TABLE `sms_logs`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `sms_templates`
--
ALTER TABLE `sms_templates`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `stocks`
--
ALTER TABLE `stocks`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT for table `stock_movements`
--
ALTER TABLE `stock_movements`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `transactions`
--
ALTER TABLE `transactions`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `users`
--
ALTER TABLE `users`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `voucher_sequences`
--
ALTER TABLE `voucher_sequences`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `add_stocks`
--
ALTER TABLE `add_stocks`
  ADD CONSTRAINT `add_stocks_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `add_stocks_ibfk_2` FOREIGN KEY (`godown_id`) REFERENCES `godowns` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `attendance`
--
ALTER TABLE `attendance`
  ADD CONSTRAINT `attendance_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `attendance_records`
--
ALTER TABLE `attendance_records`
  ADD CONSTRAINT `attendance_records_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`);

--
-- Constraints for table `employees`
--
ALTER TABLE `employees`
  ADD CONSTRAINT `employees_ibfk_1` FOREIGN KEY (`designation_id`) REFERENCES `designations` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `employee_salary`
--
ALTER TABLE `employee_salary`
  ADD CONSTRAINT `employee_salary_ibfk_1` FOREIGN KEY (`salary_id`) REFERENCES `monthly_salary` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `employee_salary_ibfk_2` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `emptybag_payments`
--
ALTER TABLE `emptybag_payments`
  ADD CONSTRAINT `emptybag_payments_ibfk_1` FOREIGN KEY (`party_id`) REFERENCES `parties` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `emptybag_products`
--
ALTER TABLE `emptybag_products`
  ADD CONSTRAINT `emptybag_products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `emptybag_categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `emptybag_purchases`
--
ALTER TABLE `emptybag_purchases`
  ADD CONSTRAINT `emptybag_purchases_ibfk_1` FOREIGN KEY (`party_id`) REFERENCES `parties` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `emptybag_sales`
--
ALTER TABLE `emptybag_sales`
  ADD CONSTRAINT `emptybag_sales_ibfk_1` FOREIGN KEY (`party_id`) REFERENCES `parties` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `parties`
--
ALTER TABLE `parties`
  ADD CONSTRAINT `parties_ibfk_1` FOREIGN KEY (`type_id`) REFERENCES `party_types` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `production_details`
--
ALTER TABLE `production_details`
  ADD CONSTRAINT `production_details_ibfk_1` FOREIGN KEY (`production_id`) REFERENCES `production_orders` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `production_items`
--
ALTER TABLE `production_items`
  ADD CONSTRAINT `production_items_ibfk_1` FOREIGN KEY (`production_id`) REFERENCES `productions` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `production_items_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `production_items_ibfk_3` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `production_items_ibfk_4` FOREIGN KEY (`godown_id`) REFERENCES `godowns` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `production_items_ibfk_5` FOREIGN KEY (`silo_id`) REFERENCES `silos` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `production_stocks`
--
ALTER TABLE `production_stocks`
  ADD CONSTRAINT `production_stocks_ibfk_1` FOREIGN KEY (`production_id`) REFERENCES `productions` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `production_stock_items`
--
ALTER TABLE `production_stock_items`
  ADD CONSTRAINT `production_stock_items_ibfk_1` FOREIGN KEY (`production_stock_id`) REFERENCES `production_stocks` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `production_stock_items_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `production_stock_items_ibfk_3` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `production_stock_items_ibfk_4` FOREIGN KEY (`godown_id`) REFERENCES `godowns` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `products`
--
ALTER TABLE `products`
  ADD CONSTRAINT `products_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `purchases`
--
ALTER TABLE `purchases`
  ADD CONSTRAINT `purchases_ibfk_1` FOREIGN KEY (`party_id`) REFERENCES `parties` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `purchases_ibfk_2` FOREIGN KEY (`broker_id`) REFERENCES `parties` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `purchase_items`
--
ALTER TABLE `purchase_items`
  ADD CONSTRAINT `purchase_items_ibfk_1` FOREIGN KEY (`purchase_id`) REFERENCES `purchases` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `purchase_items_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `purchase_items_ibfk_3` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `purchase_items_ibfk_4` FOREIGN KEY (`godown_id`) REFERENCES `godowns` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `salary`
--
ALTER TABLE `salary`
  ADD CONSTRAINT `salary_ibfk_1` FOREIGN KEY (`employee_id`) REFERENCES `employees` (`id`) ON DELETE CASCADE ON UPDATE CASCADE;

--
-- Constraints for table `sales`
--
ALTER TABLE `sales`
  ADD CONSTRAINT `sales_ibfk_1` FOREIGN KEY (`party_id`) REFERENCES `parties` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `sales_items`
--
ALTER TABLE `sales_items`
  ADD CONSTRAINT `sales_items_ibfk_1` FOREIGN KEY (`sales_id`) REFERENCES `sales` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `sales_items_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE SET NULL ON UPDATE CASCADE,
  ADD CONSTRAINT `sales_items_ibfk_3` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON UPDATE CASCADE,
  ADD CONSTRAINT `sales_items_ibfk_4` FOREIGN KEY (`godown_id`) REFERENCES `godowns` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `sms_logs`
--
ALTER TABLE `sms_logs`
  ADD CONSTRAINT `sms_logs_ibfk_1` FOREIGN KEY (`template_id`) REFERENCES `sms_templates` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;

--
-- Constraints for table `stocks`
--
ALTER TABLE `stocks`
  ADD CONSTRAINT `fk_stock_godown` FOREIGN KEY (`godown_id`) REFERENCES `godowns` (`id`) ON DELETE SET NULL,
  ADD CONSTRAINT `fk_stock_product` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE;

--
-- Constraints for table `stock_movements`
--
ALTER TABLE `stock_movements`
  ADD CONSTRAINT `stock_movements_ibfk_1` FOREIGN KEY (`product_id`) REFERENCES `products` (`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  ADD CONSTRAINT `stock_movements_ibfk_2` FOREIGN KEY (`godown_id`) REFERENCES `godowns` (`id`) ON DELETE SET NULL ON UPDATE CASCADE;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
