import { Router } from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = Router();

// GET /api/party-due - Fetch all party dues
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const [records] = await pool.query(`
      SELECT 
        id,
        name,
        company,
        mobile,
        address,
        due,
        created_at as createdAt
      FROM party_due
      ORDER BY created_at DESC
    `);

    res.json({ success: true, data: records });
  } catch (err) {
    next(err);
  }
});

// GET /api/party-due/:id - Fetch single party due
router.get("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const [records] = await pool.query(
      `SELECT 
        id,
        name,
        company,
        mobile,
        address,
        due,
        created_at as createdAt
      FROM party_due 
      WHERE id = ?`,
      [id]
    );

    if (records.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Party due record not found",
      });
    }

    res.json({ success: true, data: records[0] });
  } catch (err) {
    next(err);
  }
});

// POST /api/party-due - Create new party due
router.post("/", authenticateToken, async (req, res, next) => {
  try {
    const { name, company, mobile, address, due } = req.body;

    // Validation
    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Name is required",
      });
    }

    if (due === undefined || due === null) {
      return res.status(400).json({
        success: false,
        error: "Due amount is required",
      });
    }

    if (due < 0) {
      return res.status(400).json({
        success: false,
        error: "Due amount cannot be negative",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO party_due (name, company, mobile, address, due) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        name.trim(),
        company?.trim() || null,
        mobile?.trim() || null,
        address?.trim() || null,
        due,
      ]
    );

    const [newRecord] = await pool.query(
      `SELECT 
        id,
        name,
        company,
        mobile,
        address,
        due,
        created_at as createdAt
      FROM party_due 
      WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      data: newRecord[0],
      message: "Party due record created successfully",
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/party-due/:id - Update party due
router.put("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, company, mobile, address, due } = req.body;

    // Check if record exists
    const [existing] = await pool.query(
      "SELECT id FROM party_due WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Party due record not found",
      });
    }

    // Validation
    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Name is required",
      });
    }

    if (due === undefined || due === null) {
      return res.status(400).json({
        success: false,
        error: "Due amount is required",
      });
    }

    if (due < 0) {
      return res.status(400).json({
        success: false,
        error: "Due amount cannot be negative",
      });
    }

    await pool.query(
      `UPDATE party_due 
       SET name = ?, company = ?, mobile = ?, address = ?, due = ?
       WHERE id = ?`,
      [
        name.trim(),
        company?.trim() || null,
        mobile?.trim() || null,
        address?.trim() || null,
        due,
        id,
      ]
    );

    const [updated] = await pool.query(
      `SELECT 
        id,
        name,
        company,
        mobile,
        address,
        due,
        created_at as createdAt
      FROM party_due 
      WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: updated[0],
      message: "Party due record updated successfully",
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/party-due/:id - Delete single party due
router.delete("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if record exists
    const [existing] = await pool.query(
      "SELECT id FROM party_due WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Party due record not found",
      });
    }

    // Hard delete (as per frontend implementation)
    const [result] = await pool.query("DELETE FROM party_due WHERE id = ?", [
      id,
    ]);

    res.json({
      success: true,
      data: { deletedCount: result.affectedRows },
      message: "Party due record deleted successfully",
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/party-due - Bulk delete party dues
router.delete("/", authenticateToken, async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Provide array of IDs to delete",
      });
    }

    // Hard delete (as per frontend implementation)
    const [result] = await pool.query("DELETE FROM party_due WHERE id IN (?)", [
      ids,
    ]);

    res.json({
      success: true,
      data: { deletedCount: result.affectedRows },
      message: `${result.affectedRows} party due record(s) deleted successfully`,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
