import { Router } from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = Router();

// GET /api/accounts/transactions - Fetch all transactions
// Optional: Support date range filter for large datasets
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;

    let dateCondition = "";
    const params = [];

    if (fromDate && toDate) {
      dateCondition = "WHERE date BETWEEN ? AND ?";
      params.push(fromDate, toDate);
    } else if (fromDate) {
      dateCondition = "WHERE date >= ?";
      params.push(fromDate);
    } else if (toDate) {
      dateCondition = "WHERE date <= ?";
      params.push(toDate);
    }

    const [transactions] = await pool.query(
      `SELECT 
        t.id,
        t.date,
        COALESCE(p.name, 'N/A') as party,
        t.type as voucherType,
        t.head_type as fromHead,
        '' as toHead,
        t.description,
        t.amount,
        'completed' as status,
        t.created_at as createdAt
      FROM transactions t
      LEFT JOIN parties p ON t.party_id = p.id
      ${dateCondition}
      ORDER BY t.date DESC, t.created_at DESC`,
      params
    );

    res.json({
      success: true,
      data: transactions,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/accounts/transactions - Create new transaction
router.post("/", authenticateToken, async (req, res, next) => {
  try {
    const {
      date,
      party,
      voucherType,
      fromHead,
      toHead,
      description,
      amount,
      status = "pending",
    } = req.body;

    if (!date || !voucherType || !amount) {
      return res.status(400).json({
        success: false,
        error: "Date, voucher type, and amount are required",
      });
    }

    // Map voucherType to transaction type
    const transactionType = voucherType === "receive" ? "income" : "expense";

    const [result] = await pool.query(
      `INSERT INTO transactions (date, type, head_type, amount, description, reference_no) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [date, transactionType, fromHead || "other", amount, description, null]
    );

    const [newTransaction] = await pool.query(
      `SELECT 
        id, date, ? as party, ? as voucherType, ? as fromHead, 
        ? as toHead, description, amount, ? as status, created_at as createdAt
       FROM transactions WHERE id = ?`,
      [party, voucherType, fromHead, toHead, status, result.insertId]
    );

    res.status(201).json({
      success: true,
      data: newTransaction[0],
      message: "Transaction created successfully",
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/accounts/transactions/:id - Update transaction
router.put("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, description, amount } = req.body;

    await pool.query(
      `UPDATE transactions SET date = ?, description = ?, amount = ? WHERE id = ?`,
      [date, description, amount, id]
    );

    const [updated] = await pool.query(
      `SELECT id, date, description, amount FROM transactions WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: updated[0],
      message: "Transaction updated successfully",
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/accounts/transactions - Bulk delete transactions
router.delete("/", authenticateToken, async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Please provide an array of transaction IDs to delete",
      });
    }

    const [result] = await pool.query(
      `DELETE FROM transactions WHERE id IN (?)`,
      [ids]
    );

    res.json({
      success: true,
      data: { deletedCount: result.affectedRows },
      message: `${result.affectedRows} transaction(s) deleted successfully`,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
