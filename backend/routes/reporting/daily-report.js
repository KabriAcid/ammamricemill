// backend/routes/reports/daily.js
import { Router } from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = Router();

// GET /api/reports/daily - Fetch daily report for a specific date
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const { date } = req.query;

    // Validation
    if (!date) {
      return res.status(400).json({
        success: false,
        error: "Date parameter is required (format: YYYY-MM-DD)",
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(date)) {
      return res.status(400).json({
        success: false,
        error: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    // Calculate opening balance (sum of all transactions before this date)
    const [openingBalanceResult] = await pool.query(
      `SELECT 
        COALESCE(SUM(CASE WHEN type = 'receive' THEN amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN type = 'payment' THEN amount ELSE 0 END), 0) as openingBalance
      FROM transactions
      WHERE DATE(transaction_date) < ? AND status = 'active'`,
      [date]
    );

    const openingBalance = openingBalanceResult[0]?.openingBalance || 0;

    // Fetch receives for the day
    const [receives] = await pool.query(
      `SELECT 
        t.id,
        ROW_NUMBER() OVER (ORDER BY t.created_at) as sl,
        COALESCE(p.name, 'N/A') as party,
        COALESCE(fh.name, 'N/A') as fromHead,
        COALESCE(th.name, 'N/A') as toHead,
        COALESCE(t.description, '') as description,
        t.amount,
        t.transaction_date,
        t.created_at as createdAt
      FROM transactions t
      LEFT JOIN parties p ON t.party_id = p.id
      LEFT JOIN account_heads fh ON t.from_head_id = fh.id
      LEFT JOIN account_heads th ON t.to_head_id = th.id
      WHERE DATE(t.transaction_date) = ? 
        AND t.type = 'receive' 
        AND t.status = 'active'
      ORDER BY t.created_at ASC`,
      [date]
    );

    // Fetch payments for the day
    const [payments] = await pool.query(
      `SELECT 
        t.id,
        ROW_NUMBER() OVER (ORDER BY t.created_at) as sl,
        COALESCE(p.name, 'N/A') as party,
        COALESCE(fh.name, 'N/A') as fromHead,
        COALESCE(th.name, 'N/A') as toHead,
        COALESCE(t.description, '') as description,
        t.amount,
        t.transaction_date,
        t.created_at as createdAt
      FROM transactions t
      LEFT JOIN parties p ON t.party_id = p.id
      LEFT JOIN account_heads fh ON t.from_head_id = fh.id
      LEFT JOIN account_heads th ON t.to_head_id = th.id
      WHERE DATE(t.transaction_date) = ? 
        AND t.type = 'payment' 
        AND t.status = 'active'
      ORDER BY t.created_at ASC`,
      [date]
    );

    res.json({
      success: true,
      data: {
        receives: receives,
        payments: payments,
        openingBalance: Number(openingBalance),
        date: date,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/daily/summary - Get summary stats for date range
router.get("/summary", authenticateToken, async (req, res, next) => {
  try {
    const { from, to } = req.query;

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        error: "Both 'from' and 'to' date parameters are required",
      });
    }

    const [summary] = await pool.query(
      `SELECT 
        DATE(transaction_date) as date,
        SUM(CASE WHEN type = 'receive' THEN amount ELSE 0 END) as totalReceives,
        SUM(CASE WHEN type = 'payment' THEN amount ELSE 0 END) as totalPayments,
        COUNT(CASE WHEN type = 'receive' THEN 1 END) as receiveCount,
        COUNT(CASE WHEN type = 'payment' THEN 1 END) as paymentCount
      FROM transactions
      WHERE DATE(transaction_date) BETWEEN ? AND ?
        AND status = 'active'
      GROUP BY DATE(transaction_date)
      ORDER BY DATE(transaction_date) ASC`,
      [from, to]
    );

    res.json({
      success: true,
      data: summary,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/reports/daily/print - Log print action
router.post("/print", authenticateToken, async (req, res, next) => {
  try {
    const { date, printedBy } = req.body;
    const userId = req.user?.id;

    await pool.query(
      `INSERT INTO report_print_logs (report_type, report_date, user_id, printed_at)
       VALUES ('daily', ?, ?, NOW())`,
      [date, userId || printedBy]
    );

    res.json({
      success: true,
      message: "Print action logged successfully",
    });
  } catch (err) {
    next(err);
  }
});

export default router;