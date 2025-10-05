import { Router } from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = Router();

// GET /api/categories - List all categories
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const [categories] = await pool.query(
      `SELECT id, name, unit, description, status, created_at as createdAt FROM categories WHERE status = 'active' ORDER BY created_at DESC`
    );
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
});

// POST /api/categories - Create new category
router.post("/", authenticateToken, async (req, res, next) => {
  try {
    const { name, unit, description } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ success: false, error: "Category name is required" });
    }
    const [result] = await pool.query(
      `INSERT INTO categories (name, unit, description, status) VALUES (?, ?, ?, 'active')`,
      [name, unit || "", description || null]
    );
    const [rows] = await pool.query(
      `SELECT id, name, unit, description, status, created_at as createdAt FROM categories WHERE id = ?`,
      [result.insertId]
    );
    res.status(201).json({
      success: true,
      data: rows[0],
      message: "Category created successfully",
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/categories/:id - Update category
router.put("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, unit, description } = req.body;
    if (!name) {
      return res
        .status(400)
        .json({ success: false, error: "Category name is required" });
    }
    await pool.query(
      `UPDATE categories SET name = ?, unit = ?, description = ? WHERE id = ?`,
      [name, unit || "", description || null, id]
    );
    const [rows] = await pool.query(
      `SELECT id, name, unit, description, status, created_at as createdAt FROM categories WHERE id = ?`,
      [id]
    );
    res.json({
      success: true,
      data: rows[0],
      message: "Category updated successfully",
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/categories - Bulk delete
router.delete("/", authenticateToken, async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || !ids.length) {
      return res.status(400).json({
        success: false,
        error: "Please provide an array of IDs to delete",
      });
    }
    const [result] = await pool.query(
      `UPDATE categories SET status = 'inactive' WHERE id IN (?)`,
      [ids]
    );
    res.json({
      success: true,
      data: { deletedCount: result.affectedRows },
      message: `${result.affectedRows} category(ies) deleted successfully`,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
