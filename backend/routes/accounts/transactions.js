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
      dateCondition = "WHERE t.date BETWEEN ? AND ?";
      params.push(fromDate, toDate);
    } else if (fromDate) {
      dateCondition = "WHERE t.date >= ?";
      params.push(fromDate);
    } else if (toDate) {
      dateCondition = "WHERE t.date <= ?";
      params.push(toDate);
    }

    const [transactions] = await pool.query(
      `SELECT 
        t.id,
        t.date,
        '' as party,
        t.type as voucherType,
        CONCAT(t.head_type, ' - ', COALESCE(
          CASE t.head_type
            WHEN 'income' THEN (SELECT name FROM income_heads WHERE id = t.head_id)
            WHEN 'expense' THEN (SELECT name FROM expense_heads WHERE id = t.head_id)
            WHEN 'bank' THEN (SELECT name FROM bank_heads WHERE id = t.head_id)
            WHEN 'others' THEN (SELECT name FROM other_heads WHERE id = t.head_id)
          END, 'Unknown'
        )) as fromHead,
        '' as toHead,
        t.description,
        t.amount,
        t.status,
        t.created_at as createdAt
      FROM transactions t
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
    const { date, voucherType, headId, headType, description, amount } =
      req.body;

    if (!date || !voucherType || !amount || !headId || !headType) {
      return res.status(400).json({
        success: false,
        message:
          "Date, voucher type, amount, headId, and headType are required",
      });
    }

    // Validate head type
    const validHeadTypes = ["income", "expense", "bank", "others"];
    if (!validHeadTypes.includes(headType)) {
      return res.status(400).json({
        success: false,
        message:
          "Invalid head type. Must be one of: income, expense, bank, others",
      });
    }

    // Validate voucher type
    const validVoucherTypes = ["receive", "payment"];
    if (!validVoucherTypes.includes(voucherType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid voucher type. Must be either 'receive' or 'payment'",
      });
    }

    // Validate that the head exists
    const headTableMap = {
      income: "income_heads",
      expense: "expense_heads",
      bank: "bank_heads",
      others: "other_heads",
    };

    const [headExists] = await pool.query(
      `SELECT id FROM ${headTableMap[headType]} WHERE id = ? AND status = 'active'`,
      [headId]
    );

    if (!headExists.length) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${headType} head ID or head is inactive`,
      });
    }

    // Insert the transaction
    const [result] = await pool.query(
      `INSERT INTO transactions (
        date, type, head_id, head_type, amount, description, status
      ) VALUES (?, ?, ?, ?, ?, ?, 'active')`,
      [date, voucherType, headId, headType, amount, description || null]
    );

    // Fetch the newly created transaction
    const [newTransaction] = await pool.query(
      `SELECT 
        t.id,
        t.date,
        '' as party,
        t.type as voucherType,
        CONCAT(t.head_type, ' - ', COALESCE(
          CASE t.head_type
            WHEN 'income' THEN (SELECT name FROM income_heads WHERE id = t.head_id)
            WHEN 'expense' THEN (SELECT name FROM expense_heads WHERE id = t.head_id)
            WHEN 'bank' THEN (SELECT name FROM bank_heads WHERE id = t.head_id)
            WHEN 'others' THEN (SELECT name FROM other_heads WHERE id = t.head_id)
          END, 'Unknown'
        )) as fromHead,
        '' as toHead,
        t.description,
        t.amount,
        t.status,
        t.created_at as createdAt
      FROM transactions t
      WHERE t.id = ?`,
      [result.insertId]
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

    if (!date || !amount) {
      return res.status(400).json({
        success: false,
        message: "Date and amount are required",
      });
    }

    // Check if transaction exists
    const [existing] = await pool.query(
      "SELECT id FROM transactions WHERE id = ?",
      [id]
    );

    if (!existing.length) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    await pool.query(
      `UPDATE transactions 
       SET date = ?, description = ?, amount = ?, updated_at = NOW() 
       WHERE id = ?`,
      [date, description || null, amount, id]
    );

    const [updated] = await pool.query(
      `SELECT 
        t.id,
        t.date,
        '' as party,
        t.type as voucherType,
        CONCAT(t.head_type, ' - ', COALESCE(
          CASE t.head_type
            WHEN 'income' THEN (SELECT name FROM income_heads WHERE id = t.head_id)
            WHEN 'expense' THEN (SELECT name FROM expense_heads WHERE id = t.head_id)
            WHEN 'bank' THEN (SELECT name FROM bank_heads WHERE id = t.head_id)
            WHEN 'others' THEN (SELECT name FROM other_heads WHERE id = t.head_id)
          END, 'Unknown'
        )) as fromHead,
        '' as toHead,
        t.description,
        t.amount,
        t.status,
        t.created_at as createdAt
      FROM transactions t
      WHERE t.id = ?`,
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
