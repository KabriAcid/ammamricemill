<?php
// config/config.php

// Load environment variables using vlucas/phpdotenv
require_once __DIR__ . '/../vendor/autoload.php';

use Dotenv\Dotenv;

$dotenv = Dotenv::createImmutable(dirname(__DIR__ . '../'));
$dotenv->load();

// Database constants
const DB_HOST = getenv('DB_HOST');
const DB_PORT = getenv('DB_PORT');
const DB_DATABASE = getenv('DB_DATABASE');
const DB_USERNAME = getenv('DB_USERNAME');
const DB_PASSWORD = getenv('DB_PASSWORD');

// App constants
const APP_ENV = getenv('APP_ENV');
const APP_DEBUG = getenv('APP_DEBUG');
const APP_KEY = getenv('APP_KEY');

// Company/branding constants (from settings table, fallback to env or default)
const COMPANY_NAME = 'AMMAM RICE MILL LTD.';
const COMPANY_EMAIL = 'info@ammam.com';
const COMPANY_PHONE = '+880123456789';
const COMPANY_ADDRESS = 'Dhaka, Bangladesh';
const COMPANY_CURRENCY = 'BDT';
const COMPANY_TIMEZONE = 'Asia/Dhaka';
const COMPANY_DATE_FORMAT = 'DD/MM/YYYY';
const COMPANY_LANGUAGE = 'en';

// Other relevant constants
const JWT_SECRET = APP_KEY;
const SESSION_LIFETIME = 3600; // 1 hour

// You can add more constants as needed for your backend
