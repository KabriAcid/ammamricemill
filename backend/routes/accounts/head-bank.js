import { Router } from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = Router();

// GET /api/accounts/head-bank - Fetch all bank heads
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const [bankHeads] = await pool.query(
      `SELECT 
        bh.id, 
        bh.name,
        CAST(COALESCE(SUM(CASE WHEN t.to_head_id = bh.id AND t.to_head_type = 'bank' THEN t.amount ELSE 0 END), 0) AS DECIMAL(12,2)) as receive,
        CAST(COALESCE(SUM(CASE WHEN t.from_head_id = bh.id AND t.from_head_type = 'bank' THEN t.amount ELSE 0 END), 0) AS DECIMAL(12,2)) as payment,
        CAST(
          COALESCE(SUM(CASE WHEN t.to_head_id = bh.id AND t.to_head_type = 'bank' THEN t.amount ELSE 0 END), 0) -
          COALESCE(SUM(CASE WHEN t.from_head_id = bh.id AND t.from_head_type = 'bank' THEN t.amount ELSE 0 END), 0)
        AS DECIMAL(12,2)) as balance,
        bh.created_at as createdAt
      FROM bank_heads bh
      LEFT JOIN transactions t ON (
        (t.to_head_id = bh.id AND t.to_head_type = 'bank') OR 
        (t.from_head_id = bh.id AND t.from_head_type = 'bank')
      ) AND t.status = 'active'
      WHERE bh.status = 'active'
      GROUP BY bh.id, bh.name, bh.created_at
      ORDER BY bh.created_at DESC`
    );

    res.json({
      success: true,
      data: bankHeads,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/accounts/head-bank - Create new bank head
router.post("/", authenticateToken, async (req, res, next) => {
  try {
    const { name, receive = 0, payment = 0, balance = 0 } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Bank head name is required",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO bank_heads (name, status) VALUES (?, 'active')`,
      [name]
    );

    const [newHead] = await pool.query(
      `SELECT 
        bh.id, 
        bh.name, 
        CAST(COALESCE(SUM(CASE WHEN t.to_head_id = bh.id AND t.to_head_type = 'bank' THEN t.amount ELSE 0 END), 0) AS DECIMAL(12,2)) as receive,
        CAST(COALESCE(SUM(CASE WHEN t.from_head_id = bh.id AND t.from_head_type = 'bank' THEN t.amount ELSE 0 END), 0) AS DECIMAL(12,2)) as payment,
        CAST(
          COALESCE(SUM(CASE WHEN t.to_head_id = bh.id AND t.to_head_type = 'bank' THEN t.amount ELSE 0 END), 0) -
          COALESCE(SUM(CASE WHEN t.from_head_id = bh.id AND t.from_head_type = 'bank' THEN t.amount ELSE 0 END), 0)
        AS DECIMAL(12,2)) as balance,
        bh.created_at as createdAt 
      FROM bank_heads bh
      LEFT JOIN transactions t ON (
        (t.to_head_id = bh.id AND t.to_head_type = 'bank') OR 
        (t.from_head_id = bh.id AND t.from_head_type = 'bank')
      ) AND t.status = 'active'
      WHERE bh.id = ?
      GROUP BY bh.id, bh.name, bh.created_at`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      data: newHead[0],
      message: "Bank head created successfully",
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/accounts/head-bank/:id - Update bank head
router.put("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, receive = 0, payment = 0, balance = 0 } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Bank head name is required",
      });
    }

    await pool.query(`UPDATE bank_heads SET name = ? WHERE id = ?`, [name, id]);

    const [updated] = await pool.query(
      `SELECT 
        bh.id, 
        bh.name, 
        CAST(COALESCE(SUM(CASE WHEN t.to_head_id = bh.id AND t.to_head_type = 'bank' THEN t.amount ELSE 0 END), 0) AS DECIMAL(12,2)) as receive,
        CAST(COALESCE(SUM(CASE WHEN t.from_head_id = bh.id AND t.from_head_type = 'bank' THEN t.amount ELSE 0 END), 0) AS DECIMAL(12,2)) as payment,
        CAST(
          COALESCE(SUM(CASE WHEN t.to_head_id = bh.id AND t.to_head_type = 'bank' THEN t.amount ELSE 0 END), 0) -
          COALESCE(SUM(CASE WHEN t.from_head_id = bh.id AND t.from_head_type = 'bank' THEN t.amount ELSE 0 END), 0)
        AS DECIMAL(12,2)) as balance,
        bh.created_at as createdAt 
      FROM bank_heads bh
      LEFT JOIN transactions t ON (
        (t.to_head_id = bh.id AND t.to_head_type = 'bank') OR 
        (t.from_head_id = bh.id AND t.from_head_type = 'bank')
      ) AND t.status = 'active'
      WHERE bh.id = ?
      GROUP BY bh.id, bh.name, bh.created_at`,
      [id]
    );

    res.json({
      success: true,
      data: updated[0],
      message: "Bank head updated successfully",
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/accounts/head-bank - Bulk delete bank heads
router.delete("/", authenticateToken, async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Please provide an array of bank head IDs to delete",
      });
    }

    const [result] = await pool.query(
      `UPDATE bank_heads SET status = 'inactive' WHERE id IN (?)`,
      [ids]
    );

    res.json({
      success: true,
      data: { deletedCount: result.affectedRows },
      message: `${result.affectedRows} bank head(s) deleted successfully`,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
