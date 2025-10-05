import { Router } from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = Router();

// GET /api/accounts/head-expense - Fetch all expense heads
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const [expenseHeads] = await pool.query(
      `SELECT 
        eh.id, 
        eh.name,
        CAST(COALESCE(SUM(t.amount), 0) AS DECIMAL(12,2)) as payments,
        eh.created_at as createdAt
      FROM expense_heads eh
      LEFT JOIN transactions t ON t.to_head_id = eh.id AND t.to_head_type = 'expense' AND t.status = 'active'
      WHERE eh.status = 'active'
      GROUP BY eh.id, eh.name, eh.created_at
      ORDER BY eh.created_at DESC`
    );

    res.json({
      success: true,
      data: expenseHeads,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/accounts/head-expense - Create new expense head
router.post("/", authenticateToken, async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Expense head name is required",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO expense_heads (name, status) VALUES (?, 'active')`,
      [name]
    );

    if (!result.affectedRows || !result.insertId) {
      return res.status(500).json({
        success: false,
        error: "Failed to create expense head. Please try again.",
      });
    }

    // Insert a transaction row for the new head (opening payment = 0)
    await pool.query(
      `INSERT INTO transactions (from_head_id, from_head_type, to_head_id, to_head_type, amount, date, description, status)
       VALUES (?, ?, ?, ?, ?, CURDATE(), ?, 'active')`,
      [
        null, // from_head_id
        null, // from_head_type
        result.insertId, // to_head_id
        "expense", // to_head_type
        0,
        "Opening payment",
      ]
    );

    const [newHead] = await pool.query(
      `SELECT 
        eh.id, 
        eh.name, 
        CAST(COALESCE(SUM(t.amount), 0) AS DECIMAL(12,2)) as payments, 
        eh.created_at as createdAt 
      FROM expense_heads eh
      LEFT JOIN transactions t ON t.to_head_id = eh.id AND t.to_head_type = 'expense' AND t.status = 'active'
      WHERE eh.id = ?
      GROUP BY eh.id, eh.name, eh.created_at`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      data: newHead[0],
      message: "Expense head created successfully",
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/accounts/head-expense/:id - Update expense head
router.put("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Expense head name is required",
      });
    }

    await pool.query(`UPDATE expense_heads SET name = ? WHERE id = ?`, [
      name,
      id,
    ]);

    const [updated] = await pool.query(
      `SELECT 
        eh.id, 
        eh.name, 
        CAST(COALESCE(SUM(t.amount), 0) AS DECIMAL(12,2)) as payments, 
        eh.created_at as createdAt 
      FROM expense_heads eh
      LEFT JOIN transactions t ON t.to_head_id = eh.id AND t.to_head_type = 'expense' AND t.status = 'active'
      WHERE eh.id = ?
      GROUP BY eh.id, eh.name, eh.created_at`,
      [id]
    );

    res.json({
      success: true,
      data: updated[0],
      message: "Expense head updated successfully",
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/accounts/head-expense - Bulk delete expense heads
router.delete("/", authenticateToken, async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Please provide an array of expense head IDs to delete",
      });
    }

    const [result] = await pool.query(
      `UPDATE expense_heads SET status = 'inactive' WHERE id IN (?)`,
      [ids]
    );

    res.json({
      success: true,
      data: { deletedCount: result.affectedRows },
      message: `${result.affectedRows} expense head(s) deleted successfully`,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
