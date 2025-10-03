import { Router } from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = Router();

// GET /api/accounts/head-income - Fetch all income heads
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const [incomeHeads] = await pool.query(
      `SELECT 
        id, 
        name,
        0 as receives,
        created_at as createdAt
      FROM income_heads 
      WHERE status = 'active'
      ORDER BY created_at DESC`
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
    const { name } = req.body;

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

    const [newHead] = await pool.query(
      `SELECT id, name, 0 as receives, created_at as createdAt FROM income_heads WHERE id = ?`,
      [result.insertId]
    );

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
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Income head name is required",
      });
    }

    await pool.query(`UPDATE income_heads SET name = ? WHERE id = ?`, [
      name,
      id,
    ]);

    const [updated] = await pool.query(
      `SELECT id, name, 0 as receives, created_at as createdAt FROM income_heads WHERE id = ?`,
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
