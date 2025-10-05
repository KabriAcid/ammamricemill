# Backend Directory Structure

This document describes the structure and purpose of each directory and file in the `backend` folder of the project.

## Directory Map

```
backend/
├── .env                  # Environment variables for backend configuration
├── constants.js          # Application-wide constants
├── dir.bat               # Batch script for directory setup (if any)
├── index.js              # Main entry point for the backend server
├── package.json          # Node.js dependencies and scripts
├── README.md             # Backend documentation
├── setup-admin.js        # Script to set up the initial admin user
├── config/
│   └── config.php        # PHP config (legacy or integration)
├── middlewares/
│   ├── auth.js           # Authentication middleware
│   └── errorHandler.js   # Error handling middleware
├── routes/
│   ├── auth.js           # Authentication routes
│   ├── backup.js         # Database backup routes
│   ├── dashboard.js      # Dashboard data routes
│   ├── index.js          # Main router, registers all sub-routes
│   ├── accounts/         # Account head and transaction routes
│   ├── emptybags/        # Empty bag management routes
│   ├── hr/               # Human resources (attendance, salary, etc.)
│   ├── party/            # Party (customer/supplier) management
│   ├── production/       # Production order and details routes
│   ├── products/         # Product and category management
│   ├── purchase/         # Purchase and ledger routes
│   ├── reporting/        # Reporting endpoints
│   ├── sales/            # Sales and sales ledger routes
│   ├── settings/         # General, godown, silo, and upload settings
│   ├── sms/              # SMS sending and template routes
│   └── stocks/           # Stock management routes
├── schema/               # Database schema files (SQL)
├── utils/
│   ├── db.js             # Database connection and helpers
│   └── hash.js           # Password hashing utilities
```

## Directory & File Descriptions

- **.env**: Stores environment variables (e.g., DB credentials, secrets).
- **constants.js**: Defines constants used throughout the backend.
- **dir.bat**: Batch script for directory setup (if used).
- **index.js**: Main server entry point; initializes Express app and routes.
- **package.json**: Lists backend dependencies and scripts.
- **README.md**: Documentation for backend setup and usage.
- **setup-admin.js**: Script to create the initial admin user in the system.

### config/

- **config.php**: PHP configuration file (for legacy or integration purposes).

### middlewares/

- **auth.js**: Middleware for authentication (e.g., JWT verification).
- **errorHandler.js**: Middleware for centralized error handling.

### routes/

- **auth.js**: Handles login, registration, and authentication endpoints.
- **backup.js**: Endpoints for database backup and restore.
- **dashboard.js**: Provides dashboard statistics and data.
- **index.js**: Main router that registers all sub-routes.
- **accounts/**: CRUD for account heads (bank, expense, income, others) and transactions.
- **emptybags/**: Manage empty bag purchases, sales, stocks, and payments.
- **hr/**: Human resources (attendance, employees, salary, etc.).
- **party/**: Party (customer/supplier) management, types, debts, dues, payments.
- **production/**: Production order creation, details, and management.
- **products/**: Product and category CRUD operations.
- **purchase/**: Paddy/rice purchase and ledger management.
- **reporting/**: Daily and financial statement reports.
- **sales/**: Sales and sales ledger management.
- **settings/**: General settings, godown, silo, profile, and uploads.
- **sms/**: SMS sending and template management.
- **stocks/**: Stock management, including godown and production stocks.

### schema/

- **schema.sql**: SQL files for database schema definition.

### utils/

- **db.js**: Database connection logic and helpers.
- **hash.js**: Password hashing and verification utilities.
