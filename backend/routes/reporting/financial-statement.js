// backend/routes/reports/financial-statement.js
import { Router } from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = Router();

// GET /api/reports/financial-statement - Fetch financial statement for date range
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const { from, to } = req.query;

    // Validation
    if (!from || !to) {
      return res.status(400).json({
        success: false,
        error: "Both 'from' and 'to' date parameters are required (format: YYYY-MM-DD)",
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(from) || !dateRegex.test(to)) {
      return res.status(400).json({
        success: false,
        error: "Invalid date format. Use YYYY-MM-DD",
      });
    }

    // Validate date range
    if (new Date(from) > new Date(to)) {
      return res.status(400).json({
        success: false,
        error: "'from' date cannot be later than 'to' date",
      });
    }

    // Calculate opening balance (sum of all transactions before 'from' date)
    const [openingBalanceResult] = await pool.query(
      `SELECT 
        COALESCE(SUM(CASE WHEN type = 'receive' THEN amount ELSE 0 END), 0) -
        COALESCE(SUM(CASE WHEN type = 'payment' THEN amount ELSE 0 END), 0) as openingBalance
      FROM transactions
      WHERE DATE(transaction_date) < ? AND status = 'active'`,
      [from]
    );

    const openingBalance = openingBalanceResult[0]?.openingBalance || 0;

    // Fetch receives grouped by head for the date range
    const [receives] = await pool.query(
      `SELECT 
        ROW_NUMBER() OVER (ORDER BY SUM(t.amount) DESC) as sl,
        COALESCE(ah.name, 'Unspecified') as head,
        ah.id as headId,
        SUM(t.amount) as amount,
        COUNT(t.id) as transactionCount
      FROM transactions t
      LEFT JOIN account_heads ah ON t.to_head_id = ah.id
      WHERE DATE(t.transaction_date) BETWEEN ? AND ?
        AND t.type = 'receive' 
        AND t.status = 'active'
      GROUP BY ah.id, ah.name
      HAVING SUM(t.amount) > 0
      ORDER BY SUM(t.amount) DESC`,
      [from, to]
    );

    // Fetch payments grouped by head for the date range
    const [payments] = await pool.query(
      `SELECT 
        ROW_NUMBER() OVER (ORDER BY SUM(t.amount) DESC) as sl,
        COALESCE(ah.name, 'Unspecified') as head,
        ah.id as headId,
        SUM(t.amount) as amount,
        COUNT(t.id) as transactionCount
      FROM transactions t
      LEFT JOIN account_heads ah ON t.from_head_id = ah.id
      WHERE DATE(t.transaction_date) BETWEEN ? AND ?
        AND t.type = 'payment' 
        AND t.status = 'active'
      GROUP BY ah.id, ah.name
      HAVING SUM(t.amount) > 0
      ORDER BY SUM(t.amount) DESC`,
      [from, to]
    );

    // Calculate totals
    const totalReceives = receives.reduce((sum, item) => sum + Number(item.amount), 0);
    const totalPayments = payments.reduce((sum, item) => sum + Number(item.amount), 0);
    const closingBalance = Number(openingBalance) + totalReceives - totalPayments;

    // Add unique IDs to each row (required by frontend)
    const receivesWithIds = receives.map((item, index) => ({
      ...item,
      id: `receive-${item.headId || index}`,
    }));

    const paymentsWithIds = payments.map((item, index) => ({
      ...item,
      id: `payment-${item.headId || index}`,
    }));

    res.json({
      success: true,
      data: {
        receives: receivesWithIds,
        payments: paymentsWithIds,
        openingBalance: Number(openingBalance),
        closingBalance: Number(closingBalance),
        totalReceives: totalReceives,
        totalPayments: totalPayments,
        dateRange: { from, to },
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/financial-statement/details - Get detailed breakdown by head
router.get("/details", authenticateToken, async (req, res, next) => {
  try {
    const { from, to, headId, type } = req.query;

    if (!from || !to || !headId || !type) {
      return res.status(400).json({
        success: false,
        error: "Missing required parameters: from, to, headId, type",
      });
    }

    if (!["receive", "payment"].includes(type)) {
      return res.status(400).json({
        success: false,
        error: "Type must be either 'receive' or 'payment'",
      });
    }

    // Fetch individual transactions for the specified head
    const headColumn = type === "receive" ? "to_head_id" : "from_head_id";
    
    const [transactions] = await pool.query(
      `SELECT 
        t.id,
        t.transaction_date as date,
        COALESCE(p.name, 'N/A') as party,
        t.amount,
        t.description,
        t.created_at as createdAt
      FROM transactions t
      LEFT JOIN parties p ON t.party_id = p.id
      WHERE DATE(t.transaction_date) BETWEEN ? AND ?
        AND t.${headColumn} = ?
        AND t.type = ?
        AND t.status = 'active'
      ORDER BY t.transaction_date DESC, t.created_at DESC`,
      [from, to, headId, type]
    );

    res.json({
      success: true,
      data: transactions,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/reports/financial-statement/comparison - Compare periods
router.get("/comparison", authenticateToken, async (req, res, next) => {
  try {
    const { currentFrom, currentTo, previousFrom, previousTo } = req.query;

    if (!currentFrom || !currentTo || !previousFrom || !previousTo) {
      return res.status(400).json({
        success: false,
        error: "All date parameters required: currentFrom, currentTo, previousFrom, previousTo",
      });
    }

    // Current period totals
    const [currentTotals] = await pool.query(
      `SELECT 
        SUM(CASE WHEN type = 'receive' THEN amount ELSE 0 END) as receives,
        SUM(CASE WHEN type = 'payment' THEN amount ELSE 0 END) as payments
      FROM transactions
      WHERE DATE(transaction_date) BETWEEN ? AND ?
        AND status = 'active'`,
      [currentFrom, currentTo]
    );

    // Previous period totals
    const [previousTotals] = await pool.query(
      `SELECT 
        SUM(CASE WHEN type = 'receive' THEN amount ELSE 0 END) as receives,
        SUM(CASE WHEN type = 'payment' THEN amount ELSE 0 END) as payments
      FROM transactions
      WHERE DATE(transaction_date) BETWEEN ? AND ?
        AND status = 'active'`,
      [previousFrom, previousTo]
    );

    const currentReceives = Number(currentTotals[0]?.receives || 0);
    const currentPayments = Number(currentTotals[0]?.payments || 0);
    const previousReceives = Number(previousTotals[0]?.receives || 0);
    const previousPayments = Number(previousTotals[0]?.payments || 0);

    // Calculate percentage changes
    const receivesChange = previousReceives > 0 
      ? ((currentReceives - previousReceives) / previousReceives) * 100 
      : 0;
    const paymentsChange = previousPayments > 0 
      ? ((currentPayments - previousPayments) / previousPayments) * 100 
      : 0;

    res.json({
      success: true,
      data: {
        current: {
          receives: currentReceives,
          payments: currentPayments,
          net: currentReceives - currentPayments,
        },
        previous: {
          receives: previousReceives,
          payments: previousPayments,
          net: previousReceives - previousPayments,
        },
        changes: {
          receivesPercent: receivesChange.toFixed(2),
          paymentsPercent: paymentsChange.toFixed(2),
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/reports/financial-statement/export - Generate export data
router.post("/export", authenticateToken, async (req, res, next) => {
  try {
    const { from, to, format } = req.body;

    if (!from || !to) {
      return res.status(400).json({
        success: false,
        error: "Date range is required",
      });
    }

    // Log export action
    const userId = req.user?.id;
    await pool.query(
      `INSERT INTO report_exports (report_type, date_from, date_to, format, user_id, exported_at)
       VALUES ('financial_statement', ?, ?, ?, ?, NOW())`,
      [from, to, format || "pdf", userId]
    );

    res.json({
      success: true,
      message: "Export logged successfully",
      data: {
        exportId: Date.now(), // In real implementation, return actual export ID
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;