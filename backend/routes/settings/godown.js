import { Router } from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = Router();

// GET /api/godowns → fetch all godowns
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM godowns ORDER BY created_at DESC"
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/godowns/:id → fetch single godown
router.get("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query("SELECT * FROM godowns WHERE id = ?", [id]);

    if (rows.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Godown not found" });
    }

    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
});

// POST /api/godowns → create new godown
router.post("/", authenticateToken, async (req, res, next) => {
  try {
    const { name, capacity, description } = req.body;

    const [result] = await pool.query(
      `INSERT INTO godowns (name, capacity, description, created_at, updated_at)
       VALUES (?, ?, ?, NOW(), NOW())`,
      [name, capacity, description]
    );

    res.json({
      success: true,
      message: "Godown created",
      id: result.insertId,
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/godowns/:id → update godown
router.put("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { name, capacity, description } = req.body;
    const { id } = req.params;

    const [result] = await pool.query(
      `UPDATE godowns 
       SET name=?, capacity=?, description=?, updated_at=NOW() 
       WHERE id=?`,
      [name, capacity, description, id]
    );

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Godown not found" });
    }

    res.json({ success: true, message: "Godown updated" });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/godowns/:id → delete godown
router.delete("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const [result] = await pool.query("DELETE FROM godowns WHERE id=?", [id]);

    if (result.affectedRows === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Godown not found" });
    }

    res.json({ success: true, message: "Godown deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
