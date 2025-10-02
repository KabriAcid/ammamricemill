-- Rice Mill Management System - Database Schema
-- Clean and corrected version

-- SETTINGS TABLE
CREATE TABLE settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    company_name VARCHAR(255) NOT NULL,
    address TEXT,
    phone VARCHAR(20),
    email VARCHAR(255),
    tax_rate DECIMAL(5,2) DEFAULT 0,
    currency VARCHAR(10) DEFAULT 'NGN',
    timezone VARCHAR(50) DEFAULT 'Africa/Lagos',
    date_format VARCHAR(20) DEFAULT 'DD/MM/YYYY',
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- PARTY TYPES
CREATE TABLE party_types (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(50) NOT NULL,
    description TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- DESIGNATIONS
CREATE TABLE designations (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- CATEGORIES
CREATE TABLE categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SILOS
CREATE TABLE silos (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    capacity DECIMAL(12,2) NOT NULL,
    current_stock DECIMAL(12,2) DEFAULT 0,
    unit VARCHAR(20) NOT NULL,
    location VARCHAR(100),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- GODOWNS
CREATE TABLE godowns (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    capacity DECIMAL(12,2) NOT NULL,
    current_stock DECIMAL(12,2) DEFAULT 0,
    unit VARCHAR(20) NOT NULL,
    location VARCHAR(100),
    manager VARCHAR(100),
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- PRODUCTS
CREATE TABLE products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    category_id INT,
    unit VARCHAR(20) NOT NULL,
    price DECIMAL(10,2) DEFAULT 0,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- USERS
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role ENUM('admin', 'manager', 'user') DEFAULT 'user',
    phone VARCHAR(20),
    address TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- EMPLOYEES
CREATE TABLE employees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20),
    designation_id INT,
    salary DECIMAL(10,2) DEFAULT 0,
    joining_date DATE,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (designation_id) REFERENCES designations(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- PARTIES
CREATE TABLE parties (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(255) NOT NULL,
    type_id INT,
    phone VARCHAR(20),
    address TEXT,
    balance DECIMAL(12,2) DEFAULT 0,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (type_id) REFERENCES party_types(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- INCOME HEADS
CREATE TABLE income_heads (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- EXPENSE HEADS
CREATE TABLE expense_heads (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- BANK HEADS
CREATE TABLE bank_heads (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    account_number VARCHAR(50),
    bank_name VARCHAR(100),
    description TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ATTENDANCE
CREATE TABLE attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    date DATE NOT NULL,
    check_in TIME,
    check_out TIME,
    status ENUM('present', 'absent', 'late', 'half-day', 'leave') DEFAULT 'present',
    working_hours DECIMAL(4,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY unique_employee_date (employee_id, date)
);

-- SALARY
CREATE TABLE salary (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT NOT NULL,
    month VARCHAR(7) NOT NULL, -- YYYY-MM format
    basic_salary DECIMAL(10,2) NOT NULL,
    allowances DECIMAL(10,2) DEFAULT 0,
    deductions DECIMAL(10,2) DEFAULT 0,
    net_salary DECIMAL(10,2) NOT NULL,
    status ENUM('draft', 'pending', 'paid') DEFAULT 'draft',
    paid_date DATE NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE ON UPDATE CASCADE,
    UNIQUE KEY unique_employee_month (employee_id, month)
);

-- TRANSACTIONS
CREATE TABLE transactions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    type ENUM('income', 'expense', 'receive', 'payment') NOT NULL,
    head_type ENUM('income', 'expense', 'bank', 'other') NOT NULL,
    head_id INT NOT NULL,
    party_id INT NULL,
    amount DECIMAL(12,2) NOT NULL,
    description TEXT,
    reference_no VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_date (date),
    INDEX idx_type (type),
    FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- PURCHASES
CREATE TABLE purchases (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    invoice_no VARCHAR(50) NOT NULL UNIQUE,
    challan_no VARCHAR(50),
    party_id INT,
    transport_info TEXT,
    broker_id INT,
    notes TEXT,
    total_quantity DECIMAL(12,2) DEFAULT 0,
    total_net_weight DECIMAL(12,2) DEFAULT 0,
    invoice_amount DECIMAL(12,2) DEFAULT 0,
    discount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) DEFAULT 0,
    previous_balance DECIMAL(12,2) DEFAULT 0,
    net_payable DECIMAL(12,2) DEFAULT 0,
    paid_amount DECIMAL(12,2) DEFAULT 0,
    current_balance DECIMAL(12,2) DEFAULT 0,
    payment_mode ENUM('cash', 'bank', 'upi', 'cheque', 'other') DEFAULT 'cash',
    reference_no VARCHAR(50),
    status ENUM('draft', 'pending', 'completed', 'cancelled') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (broker_id) REFERENCES parties(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- PURCHASE ITEMS
CREATE TABLE purchase_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    purchase_id INT NOT NULL,
    category_id INT,
    product_id INT NOT NULL,
    godown_id INT,
    quantity DECIMAL(12,2) DEFAULT 0,
    net_weight DECIMAL(12,2) DEFAULT 0,
    rate DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (purchase_id) REFERENCES purchases(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (godown_id) REFERENCES godowns(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- SALES
CREATE TABLE sales (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    invoice_no VARCHAR(50) NOT NULL UNIQUE,
    party_id INT,
    transport_info TEXT,
    notes TEXT,
    total_quantity DECIMAL(12,2) DEFAULT 0,
    total_net_weight DECIMAL(12,2) DEFAULT 0,
    invoice_amount DECIMAL(12,2) DEFAULT 0,
    discount DECIMAL(12,2) DEFAULT 0,
    total_amount DECIMAL(12,2) DEFAULT 0,
    previous_balance DECIMAL(12,2) DEFAULT 0,
    net_receivable DECIMAL(12,2) DEFAULT 0,
    received_amount DECIMAL(12,2) DEFAULT 0,
    current_balance DECIMAL(12,2) DEFAULT 0,
    payment_mode ENUM('cash', 'bank', 'upi', 'cheque', 'other') DEFAULT 'cash',
    reference_no VARCHAR(50),
    status ENUM('draft', 'pending', 'delivered', 'cancelled') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- SALES ITEMS
CREATE TABLE sales_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    sales_id INT NOT NULL,
    category_id INT,
    product_id INT NOT NULL,
    godown_id INT,
    quantity DECIMAL(12,2) DEFAULT 0,
    net_weight DECIMAL(12,2) DEFAULT 0,
    rate DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (sales_id) REFERENCES sales(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (godown_id) REFERENCES godowns(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- PRODUCTIONS
CREATE TABLE productions (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    invoice_no VARCHAR(50) NOT NULL UNIQUE,
    order_no VARCHAR(50),
    description TEXT,
    total_quantity DECIMAL(12,2) DEFAULT 0,
    total_weight DECIMAL(12,2) DEFAULT 0,
    start_time DATETIME,
    end_time DATETIME,
    labor_cost DECIMAL(10,2) DEFAULT 0,
    electricity_cost DECIMAL(10,2) DEFAULT 0,
    other_costs DECIMAL(10,2) DEFAULT 0,
    total_cost DECIMAL(12,2) DEFAULT 0,
    status ENUM('draft', 'in-progress', 'completed', 'cancelled') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- PRODUCTION ITEMS
CREATE TABLE production_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    production_id INT NOT NULL,
    category_id INT,
    product_id INT NOT NULL,
    godown_id INT,
    silo_id INT,
    quantity DECIMAL(12,2) DEFAULT 0,
    net_weight DECIMAL(12,2) DEFAULT 0,
    item_type ENUM('input', 'output', 'byproduct') DEFAULT 'input',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (production_id) REFERENCES productions(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (godown_id) REFERENCES godowns(id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (silo_id) REFERENCES silos(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- PRODUCTION STOCKS
CREATE TABLE production_stocks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    invoice_no VARCHAR(50) NOT NULL UNIQUE,
    production_id INT,
    production_no VARCHAR(50),
    description TEXT,
    total_quantity DECIMAL(12,2) DEFAULT 0,
    total_net_weight DECIMAL(12,2) DEFAULT 0,
    status ENUM('draft', 'completed') DEFAULT 'draft',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (production_id) REFERENCES productions(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- PRODUCTION STOCK ITEMS
CREATE TABLE production_stock_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    production_stock_id INT NOT NULL,
    category_id INT,
    product_id INT NOT NULL,
    size VARCHAR(50),
    weight VARCHAR(50),
    godown_id INT,
    quantity DECIMAL(12,2) DEFAULT 0,
    net_weight DECIMAL(12,2) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (production_stock_id) REFERENCES production_stocks(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL ON UPDATE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (godown_id) REFERENCES godowns(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- STOCK MOVEMENTS
CREATE TABLE stock_movements (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    product_id INT NOT NULL,
    godown_id INT,
    movement_type ENUM('opening', 'purchase', 'production-in', 'production-out', 'sales', 'transfer', 'adjustment', 'add') NOT NULL,
    reference_type VARCHAR(50),
    reference_id INT,
    quantity_in DECIMAL(12,2) DEFAULT 0,
    quantity_out DECIMAL(12,2) DEFAULT 0,
    balance DECIMAL(12,2) DEFAULT 0,
    rate DECIMAL(10,2) DEFAULT 0,
    remarks TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (godown_id) REFERENCES godowns(id) ON DELETE SET NULL ON UPDATE CASCADE,
    INDEX idx_date (date),
    INDEX idx_product (product_id),
    INDEX idx_movement_type (movement_type)
);

-- ADD STOCKS (manual stock additions)
CREATE TABLE add_stocks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    product_id INT NOT NULL,
    godown_id INT,
    quantity DECIMAL(12,2) NOT NULL,
    net_weight DECIMAL(12,2) NOT NULL,
    rate DECIMAL(10,2) DEFAULT 0,
    total_price DECIMAL(12,2) DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT ON UPDATE CASCADE,
    FOREIGN KEY (godown_id) REFERENCES godowns(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- EMPTYBAG CATEGORIES
CREATE TABLE emptybag_categories (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- EMPTYBAG PRODUCTS
CREATE TABLE emptybag_products (
    id INT PRIMARY KEY AUTO_INCREMENT,
    category_id INT,
    name VARCHAR(100) NOT NULL,
    size VARCHAR(50),
    weight DECIMAL(10,2),
    unit VARCHAR(20) DEFAULT 'pieces',
    price DECIMAL(10,2) DEFAULT 0,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES emptybag_categories(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- EMPTYBAG PURCHASES
CREATE TABLE emptybag_purchases (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    invoice_no VARCHAR(50) NOT NULL UNIQUE,
    party_id INT,
    items INT DEFAULT 0,
    quantity DECIMAL(10,2) DEFAULT 0,
    price DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(12,2) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- EMPTYBAG SALES
CREATE TABLE emptybag_sales (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    invoice_no VARCHAR(50) NOT NULL UNIQUE,
    party_id INT,
    items INT DEFAULT 0,
    quantity DECIMAL(10,2) DEFAULT 0,
    price DECIMAL(10,2) DEFAULT 0,
    total_amount DECIMAL(12,2) DEFAULT 0,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- EMPTYBAG PAYMENTS
CREATE TABLE emptybag_payments (
    id INT PRIMARY KEY AUTO_INCREMENT,
    date DATE NOT NULL,
    invoice_no VARCHAR(50) NOT NULL,
    party_id INT,
    items INT DEFAULT 0,
    quantity DECIMAL(10,2) DEFAULT 0,
    amount DECIMAL(12,2) DEFAULT 0,
    payment_mode ENUM('cash', 'bank', 'upi', 'cheque', 'other') DEFAULT 'cash',
    reference_no VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (party_id) REFERENCES parties(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- SMS TEMPLATES
CREATE TABLE sms_templates (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL,
    content TEXT NOT NULL,
    variables TEXT,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- SMS LOGS
CREATE TABLE sms_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    template_id INT,
    recipient VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    status ENUM('pending', 'sent', 'failed') DEFAULT 'pending',
    error_message TEXT,
    sent_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (template_id) REFERENCES sms_templates(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- FINANCIAL YEARS
CREATE TABLE financial_years (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    status ENUM('active', 'inactive') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);