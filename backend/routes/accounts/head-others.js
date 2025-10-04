import { Router } from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = Router();

// GET /api/accounts/head-others - Fetch all other heads
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const [otherHeads] = await pool.query(
      `SELECT 
        oh.id, 
        oh.name,
        CAST(COALESCE(SUM(CASE WHEN t.to_head_id = oh.id AND t.to_head_type = 'others' THEN t.amount ELSE 0 END), 0) AS DECIMAL(12,2)) as receive,
        CAST(COALESCE(SUM(CASE WHEN t.from_head_id = oh.id AND t.from_head_type = 'others' THEN t.amount ELSE 0 END), 0) AS DECIMAL(12,2)) as payment,
        CAST(
          COALESCE(SUM(CASE WHEN t.to_head_id = oh.id AND t.to_head_type = 'others' THEN t.amount ELSE 0 END), 0) -
          COALESCE(SUM(CASE WHEN t.from_head_id = oh.id AND t.from_head_type = 'others' THEN t.amount ELSE 0 END), 0)
        AS DECIMAL(12,2)) as balance,
        oh.created_at as createdAt
      FROM other_heads oh
      LEFT JOIN transactions t ON (
        (t.to_head_id = oh.id AND t.to_head_type = 'others') OR 
        (t.from_head_id = oh.id AND t.from_head_type = 'others')
      ) AND t.status = 'active'
      WHERE oh.status = 'active'
      GROUP BY oh.id, oh.name, oh.created_at
      ORDER BY oh.created_at DESC`
    );

    res.json({
      success: true,
      data: otherHeads,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/accounts/head-others - Create new other head
router.post("/", authenticateToken, async (req, res, next) => {
  try {
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Other head name is required",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO other_heads (name, status) VALUES (?, 'active')`,
      [name]
    );

    const [newHead] = await pool.query(
      `SELECT 
        oh.id, 
        oh.name,
        CAST(COALESCE(SUM(CASE WHEN t.to_head_id = oh.id AND t.to_head_type = 'others' THEN t.amount ELSE 0 END), 0) AS DECIMAL(12,2)) as receive,
        CAST(COALESCE(SUM(CASE WHEN t.from_head_id = oh.id AND t.from_head_type = 'others' THEN t.amount ELSE 0 END), 0) AS DECIMAL(12,2)) as payment,
        CAST(
          COALESCE(SUM(CASE WHEN t.to_head_id = oh.id AND t.to_head_type = 'others' THEN t.amount ELSE 0 END), 0) -
          COALESCE(SUM(CASE WHEN t.from_head_id = oh.id AND t.from_head_type = 'others' THEN t.amount ELSE 0 END), 0)
        AS DECIMAL(12,2)) as balance,
        oh.created_at as createdAt 
      FROM other_heads oh
      LEFT JOIN transactions t ON (
        (t.to_head_id = oh.id AND t.to_head_type = 'others') OR 
        (t.from_head_id = oh.id AND t.from_head_type = 'others')
      ) AND t.status = 'active'
      WHERE oh.id = ?
      GROUP BY oh.id, oh.name, oh.created_at`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      data: newHead[0],
      message: "Other head created successfully",
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/accounts/head-others/:id - Update other head
router.put("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Other head name is required",
      });
    }

    await pool.query(`UPDATE other_heads SET name = ? WHERE id = ?`, [
      name,
      id,
    ]);

    const [updated] = await pool.query(
      `SELECT 
        oh.id, 
        oh.name,
        CAST(COALESCE(SUM(CASE WHEN t.to_head_id = oh.id AND t.to_head_type = 'others' THEN t.amount ELSE 0 END), 0) AS DECIMAL(12,2)) as receive,
        CAST(COALESCE(SUM(CASE WHEN t.from_head_id = oh.id AND t.from_head_type = 'others' THEN t.amount ELSE 0 END), 0) AS DECIMAL(12,2)) as payment,
        CAST(
          COALESCE(SUM(CASE WHEN t.to_head_id = oh.id AND t.to_head_type = 'others' THEN t.amount ELSE 0 END), 0) -
          COALESCE(SUM(CASE WHEN t.from_head_id = oh.id AND t.from_head_type = 'others' THEN t.amount ELSE 0 END), 0)
        AS DECIMAL(12,2)) as balance,
        oh.created_at as createdAt
      FROM other_heads oh
      LEFT JOIN transactions t ON (
        (t.to_head_id = oh.id AND t.to_head_type = 'others') OR 
        (t.from_head_id = oh.id AND t.from_head_type = 'others')
      ) AND t.status = 'active'
      WHERE oh.id = ?
      GROUP BY oh.id, oh.name, oh.created_at`,
      [id]
    );

    res.json({
      success: true,
      data: updated[0],
      message: "Other head updated successfully",
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/accounts/head-others - Bulk delete other heads
router.delete("/", authenticateToken, async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of other head IDs to delete",
      });
    }

    const [result] = await pool.query(
      `UPDATE other_heads SET status = 'inactive' WHERE id IN (?)`,
      [ids]
    );

    res.json({
      success: true,
      message: `${result.affectedRows} other head(s) deleted successfully`,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
