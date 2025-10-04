# Database Migrations

This folder contains database migration files for updating the ammamricemill database schema.

## How to Run Migrations

### Option 1: Using phpMyAdmin (Recommended for Development)

1. Open phpMyAdmin in your browser (usually http://localhost/phpmyadmin)
2. Select the `ammamricemill` database
3. Click on the "SQL" tab
4. Copy the contents of the migration file
5. Paste into the SQL query box
6. Click "Go" to execute

### Option 2: Using MySQL Command Line

```bash
mysql -u root -p ammamricemill < schema/migrations/001_update_transactions_to_double_entry.sql
```

### Option 3: Using MySQL Workbench

1. Open MySQL Workbench
2. Connect to your database server
3. Select the `ammamricemill` schema
4. File → Open SQL Script
5. Select the migration file
6. Click the lightning bolt icon to execute

## Migration Files

### 001_update_transactions_to_double_entry.sql

**Purpose:** Updates the transactions table from V1 single-entry to V2 double-entry accounting system.

**Changes:**

- Adds `from_head_id` and `from_head_type` columns
- Adds `to_head_id` and `to_head_type` columns
- Adds `voucher_no` column for transaction tracking
- Adds `party_id` column for party-based transactions
- Migrates existing data from old structure to new structure
- Adds indexes for better query performance

**Impact:**

- ✅ Enables double-entry accounting
- ✅ All head amount calculations will work correctly
- ✅ Backward compatible (old columns retained)
- ✅ No data loss

**Before Running:**

1. Backup your database: `mysqldump -u root -p ammamricemill > backup_before_migration.sql`
2. Verify you're running on the correct database

**After Running:**

1. Test all account head pages (Income, Expense, Bank, Others)
2. Verify amounts are calculated correctly
3. If everything works, you can uncomment the DROP COLUMN statements to remove old columns

## Testing Checklist

After running the migration, test these pages:

- [ ] Income Head - Check "Receives" column shows correct amounts
- [ ] Expense Head - Check "Payments" column shows correct amounts
- [ ] Bank Head - Check "Receive", "Payment", and "Balance" columns
- [ ] Others Head - Check "Receive", "Payment", and "Balance" columns
- [ ] Transactions List - Verify existing transactions still display
- [ ] Create New Transaction - Verify new transaction creation works

## Rollback (If Needed)

If something goes wrong, you can restore from backup:

```bash
mysql -u root -p ammamricemill < backup_before_migration.sql
```

## Support

If you encounter any issues:

1. Check MySQL error logs
2. Verify table structure: `DESCRIBE transactions;`
3. Check if migration was partially applied
4. Restore from backup and try again
