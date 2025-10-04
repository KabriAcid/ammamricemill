import { Router } from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = Router();

// GET /api/accounts/head-income - Fetch all income heads
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const [incomeHeads] = await pool.query(
      `SELECT 
        ih.id, 
        ih.name,
        CAST(COALESCE(SUM(t.amount), 0) AS DECIMAL(12,2)) as receives,
        ih.created_at as createdAt
      FROM income_heads ih
      LEFT JOIN transactions t ON t.to_head_id = ih.id AND t.to_head_type = 'income' AND t.status = 'active'
      WHERE ih.status = 'active'
      GROUP BY ih.id, ih.name, ih.created_at
      ORDER BY ih.created_at DESC`
    );

    res.json({
      success: true,
      data: incomeHeads,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/accounts/head-income - Create new income head
router.post("/", authenticateToken, async (req, res, next) => {
  try {
    const { name, receives = 0 } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Income head name is required",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO income_heads (name, status) VALUES (?, 'active')`,
      [name]
    );

    if (!result.affectedRows || !result.insertId) {
      return res.status(500).json({
        success: false,
        error: "Failed to create income head. Please try again.",
      });
    }

    // Insert a transaction row for the new head (opening balance or initial receive)
    const amount =
      typeof receives === "number" ? receives : parseFloat(receives) || 0;
    await pool.query(
      `INSERT INTO transactions (from_head_id, from_head_type, to_head_id, to_head_type, amount, date, description, status)
       VALUES (?, ?, ?, ?, ?, CURDATE(), ?, 'active')`,
      [
        null, // from_head_id
        null, // from_head_type
        result.insertId, // to_head_id
        "income", // to_head_type
        amount,
        "Opening balance",
      ]
    );

    const [newHead] = await pool.query(
      `SELECT 
        ih.id, 
        ih.name,
        COALESCE(SUM(t.amount), 0) as receives,
        ih.created_at as createdAt
      FROM income_heads ih
      LEFT JOIN transactions t ON t.to_head_id = ih.id AND t.to_head_type = 'income' AND t.status = 'active'
      WHERE ih.id = ?
      GROUP BY ih.id, ih.name, ih.created_at`,
      [result.insertId]
    );

    if (!newHead || !newHead[0]) {
      return res.status(500).json({
        success: false,
        error: "Income head was created but could not be retrieved.",
      });
    }

    res.status(201).json({
      success: true,
      data: newHead[0],
      message: "Income head created successfully",
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/accounts/head-income/:id - Update income head
router.put("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, receives } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Income head name is required",
      });
    }

    await pool.query(
      `UPDATE income_heads SET name = ? WHERE id = ? AND status = 'active'`,
      [name, id]
    );

    // First, check if the income head exists and is active
    const [existingHead] = await pool.query(
      `SELECT id FROM income_heads WHERE id = ? AND status = 'active'`,
      [id]
    );

    if (!existingHead || existingHead.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Income head not found or inactive",
      });
    }

    // Update only the name
    await pool.query(`UPDATE income_heads SET name = ? WHERE id = ?`, [
      name,
      id,
    ]);

    const [updated] = await pool.query(
      `SELECT 
        ih.id, 
        ih.name,
        COALESCE(SUM(t.amount), 0) as receives,
        ih.created_at as createdAt
      FROM income_heads ih
      LEFT JOIN transactions t ON t.to_head_id = ih.id AND t.to_head_type = 'income' AND t.status = 'active'
      WHERE ih.id = ?
      GROUP BY ih.id, ih.name, ih.created_at`,
      [id]
    );

    res.json({
      success: true,
      data: updated[0],
      message: "Income head updated successfully",
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/accounts/head-income - Bulk delete income heads
router.delete("/", authenticateToken, async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Please provide an array of income head IDs to delete",
      });
    }

    const [result] = await pool.query(
      `UPDATE income_heads SET status = 'inactive' WHERE id IN (?)`,
      [ids]
    );

    if (!result.affectedRows) {
      return res.status(404).json({
        success: false,
        error: "No income heads were deleted. IDs may not exist.",
      });
    }

    res.json({
      success: true,
      data: { deletedCount: result.affectedRows },
      message: `${result.affectedRows} income head(s) deleted successfully`,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
