@echo off
SETLOCAL ENABLEDELAYEDEXPANSION

REM Root routes folder
set ROOT=routes

REM Create top-level folders
mkdir %ROOT%
mkdir %ROOT%\settings
mkdir %ROOT%\hr
mkdir %ROOT%\accounts
mkdir %ROOT%\party
mkdir %ROOT%\products
mkdir %ROOT%\emptybags
mkdir %ROOT%\purchase
mkdir %ROOT%\sales
mkdir %ROOT%\production
mkdir %ROOT%\stocks
mkdir %ROOT%\reporting
mkdir %ROOT%\sms

REM Standalone files
type nul > %ROOT%\dashboard.js
type nul > %ROOT%\backup.js

REM Settings
type nul > %ROOT%\settings\general.js
type nul > %ROOT%\settings\silo.js
type nul > %ROOT%\settings\godown.js

REM HR
type nul > %ROOT%\hr\designation.js
type nul > %ROOT%\hr\employee.js
type nul > %ROOT%\hr\attendance.js
type nul > %ROOT%\hr\monthly-attendance.js
type nul > %ROOT%\hr\salary.js

REM Accounts
type nul > %ROOT%\accounts\head-income.js
type nul > %ROOT%\accounts\head-expense.js
type nul > %ROOT%\accounts\head-bank.js
type nul > %ROOT%\accounts\head-others.js
type nul > %ROOT%\accounts\transactions.js

REM Party
type nul > %ROOT%\party\party-types.js
type nul > %ROOT%\party\parties.js
type nul > %ROOT%\party\payments.js
type nul > %ROOT%\party\due.js
type nul > %ROOT%\party\debts.js

REM Products
type nul > %ROOT%\products\category.js
type nul > %ROOT%\products\products.js

REM Empty Bags
type nul > %ROOT%\emptybags\purchase.js
type nul > %ROOT%\emptybags\sales.js
type nul > %ROOT%\emptybags\receive.js
type nul > %ROOT%\emptybags\payment.js
type nul > %ROOT%\emptybags\stocks.js

REM Purchase
type nul > %ROOT%\purchase\paddy-purchase.js
type nul > %ROOT%\purchase\paddy-ledger.js
type nul > %ROOT%\purchase\rice-purchase.js
type nul > %ROOT%\purchase\rice-ledger.js

REM Sales
type nul > %ROOT%\sales\sales-list.js
type nul > %ROOT%\sales\sales-ledger.js

REM Production
type nul > %ROOT%\production\production-order.js
type nul > %ROOT%\production\production-details.js

REM Stocks
type nul > %ROOT%\stocks\main-stocks.js
type nul > %ROOT%\stocks\godown-stocks.js
type nul > %ROOT%\stocks\stock-register.js
type nul > %ROOT%\stocks\add-stocks.js
type nul > %ROOT%\stocks\production-stocks-list.js
type nul > %ROOT%\stocks\production-stocks-details.js
type nul > %ROOT%\stocks\emptybag-stocks.js

REM Reporting
type nul > %ROOT%\reporting\daily-report.js
type nul > %ROOT%\reporting\financial-statement.js

REM SMS
type nul > %ROOT%\sms\templates.js
type nul > %ROOT%\sms\send.js

echo.
echo Directory structure and files created successfully!
pause
