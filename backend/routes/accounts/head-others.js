import { Router } from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = Router();

// GET /api/accounts/head-others - Fetch all other heads
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const [otherHeads] = await pool.query(
      `SELECT 
        id, 
        name,
        COALESCE(
          (SELECT SUM(amount) FROM transactions 
           WHERE head_id = oh.id AND type = 'receive' AND head_type = 'others'),
          0
        ) as receive,
        COALESCE(
          (SELECT SUM(amount) FROM transactions 
           WHERE head_id = oh.id AND type = 'payment' AND head_type = 'others'),
          0
        ) as payment,
        COALESCE(
          (SELECT SUM(CASE WHEN type = 'receive' THEN amount ELSE -amount END) 
           FROM transactions 
           WHERE head_id = oh.id AND head_type = 'others'),
          0
        ) as balance,
        created_at as createdAt
      FROM other_heads oh
      WHERE status = 'active'
      ORDER BY created_at DESC`
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
        id, 
        name,
        0 as receive,
        0 as payment,
        0 as balance,
        created_at as createdAt 
      FROM other_heads 
      WHERE id = ?`,
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
        id, 
        name,
        COALESCE(
          (SELECT SUM(amount) FROM transactions 
           WHERE head_id = oh.id AND type = 'receive' AND head_type = 'others'),
          0
        ) as receive,
        COALESCE(
          (SELECT SUM(amount) FROM transactions 
           WHERE head_id = oh.id AND type = 'payment' AND head_type = 'others'),
          0
        ) as payment,
        COALESCE(
          (SELECT SUM(CASE WHEN type = 'receive' THEN amount ELSE -amount END) 
           FROM transactions 
           WHERE head_id = oh.id AND head_type = 'others'),
          0
        ) as balance,
        created_at as createdAt
      FROM other_heads oh
      WHERE id = ?`,
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
