# Ammam Rice Mill Backend Structure

This backend is built with **Express.js**, **MySQL**, **JWT authentication (with refresh tokens)**, and modern best practices for security and maintainability.

## Key Technologies

- express
- dotenv
- mysql2
- argon2
- jsonwebtoken
- cors
- cookie-parser

## Folder Structure

```
backend/
├── .env                  # Environment variables (DB, JWT secrets, etc.)
├── constants.js          # App-wide constants (JWT secrets, expiry, etc.)
├── index.js              # Main Express app entry point
├── package.json          # Node dependencies and scripts
├── config/
│   └── config.php        # (Legacy or PHP config, not used by Node backend)
├── middlewares/
│   ├── auth.js           # JWT authentication middleware
│   └── errorHandler.js   # Centralized error handler
├── routes/
│   ├── auth.js           # Auth endpoints: login, refresh, logout
│   └── index.js          # Main router, imports all route modules
├── utils/
│   ├── db.js             # MySQL connection pool (mysql2/promise)
│   └── hash.js           # Argon2 password hashing/verification
```

## Main Files & Their Roles

- **index.js**: Sets up Express, CORS, dotenv, cookie-parser, error handler, and mounts all routes under `/api`.
- **constants.js**: JWT/refresh token secrets and expiry times (from `.env` or defaults).
- **middlewares/auth.js**: Protects routes by verifying JWT access tokens.
- **middlewares/errorHandler.js**: Handles errors and sends JSON responses.
- **utils/db.js**: Exports a MySQL connection pool using environment variables.
- **utils/hash.js**: Exports `hashPassword` and `verifyPassword` using argon2.
- **routes/auth.js**: Implements `/login`, `/refresh`, and `/logout` endpoints with JWT and refresh token logic.
- **routes/index.js**: Combines all route modules for easy mounting.

## Auth Flow

- **Login**: `/api/auth/login` (POST) — issues JWT and refresh token cookies.
- **Refresh**: `/api/auth/refresh` (POST) — issues new JWT using refresh token.
- **Logout**: `/api/auth/logout` (POST) — clears cookies.

## Environment Variables (`.env`)

```
PORT=5000
CLIENT_URL=http://localhost:3000
DB_HOST=localhost
DB_USER=youruser
DB_PASSWORD=yourpassword
DB_NAME=yourdb
JWT_SECRET=your_jwt_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
```