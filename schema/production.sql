-- Production Orders Table
CREATE TABLE IF NOT EXISTS production_orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    invoice_no VARCHAR(50) NOT NULL UNIQUE,
    date DATE NOT NULL,
    description TEXT,
    silo_info TEXT,
    total_quantity INT NOT NULL DEFAULT 0,
    total_weight DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status ENUM('active', 'completed', 'cancelled') DEFAULT 'active',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_date (date),
    INDEX idx_invoice (invoice_no),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Production Items Table
CREATE TABLE IF NOT EXISTS production_items (
    id INT PRIMARY KEY AUTO_INCREMENT,
    production_id INT NOT NULL,
    category_id VARCHAR(50) NOT NULL,
    product_id VARCHAR(50) NOT NULL,
    godown_id VARCHAR(50) NOT NULL,
    silo_id VARCHAR(50) NOT NULL,
    quantity INT NOT NULL DEFAULT 0,
    net_weight DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (production_id) REFERENCES production_orders(id) ON DELETE CASCADE,
    INDEX idx_production (production_id),
    INDEX idx_category (category_id),
    INDEX idx_product (product_id),
    INDEX idx_godown (godown_id),
    INDEX idx_silo (silo_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Production Details Table
CREATE TABLE IF NOT EXISTS production_details (
    id INT PRIMARY KEY AUTO_INCREMENT,
    production_id INT NOT NULL,
    date DATE NOT NULL,
    quantity_produced INT NOT NULL DEFAULT 0,
    weight_produced DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    status ENUM('pending', 'completed', 'cancelled') DEFAULT 'pending',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (production_id) REFERENCES production_orders(id) ON DELETE CASCADE,
    INDEX idx_production (production_id),
    INDEX idx_date (date),
    INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;