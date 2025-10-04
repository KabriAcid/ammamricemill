import { Router } from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = Router();

// GET /api/party-debts - Fetch all party debts
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const [records] = await pool.query(`
      SELECT 
        id,
        name,
        company,
        mobile,
        address,
        debts,
        created_at as createdAt
      FROM party_debts
      ORDER BY created_at DESC
    `);
    
    res.json({ success: true, data: records });
  } catch (err) {
    next(err);
  }
});

// GET /api/party-debts/:id - Fetch single party debt
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
        debts,
        created_at as createdAt
      FROM party_debts 
      WHERE id = ?`,
      [id]
    );
    
    if (records.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: "Party debt record not found" 
      });
    }
    
    res.json({ success: true, data: records[0] });
  } catch (err) {
    next(err);
  }
});

// POST /api/party-debts - Create new party debt
router.post("/", authenticateToken, async (req, res, next) => {
  try {
    const { name, company, mobile, address, debts } = req.body;
    
    // Validation
    if (!name || name.trim() === "") {
      return res.status(400).json({ 
        success: false, 
        error: "Name is required" 
      });
    }
    
    if (debts === undefined || debts === null) {
      return res.status(400).json({ 
        success: false, 
        error: "Debts amount is required" 
      });
    }
    
    if (debts < 0) {
      return res.status(400).json({ 
        success: false, 
        error: "Debts amount cannot be negative" 
      });
    }
    
    const [result] = await pool.query(
      `INSERT INTO party_debts (name, company, mobile, address, debts) 
       VALUES (?, ?, ?, ?, ?)`,
      [
        name.trim(),
        company?.trim() || null,
        mobile?.trim() || null,
        address?.trim() || null,
        debts
      ]
    );
    
    const [newRecord] = await pool.query(
      `SELECT 
        id,
        name,
        company,
        mobile,
        address,
        debts,
        created_at as createdAt
      FROM party_debts 
      WHERE id = ?`,
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      data: newRecord[0],
      message: "Party debt record created successfully"
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/party-debts/:id - Update party debt
router.put("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, company, mobile, address, debts } = req.body;
    
    // Check if record exists
    const [existing] = await pool.query(
      "SELECT id FROM party_debts WHERE id = ?",
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: "Party debt record not found" 
      });
    }
    
    // Validation
    if (!name || name.trim() === "") {
      return res.status(400).json({ 
        success: false, 
        error: "Name is required" 
      });
    }
    
    if (debts === undefined || debts === null) {
      return res.status(400).json({ 
        success: false, 
        error: "Debts amount is required" 
      });
    }
    
    if (debts < 0) {
      return res.status(400).json({ 
        success: false, 
        error: "Debts amount cannot be negative" 
      });
    }
    
    await pool.query(
      `UPDATE party_debts 
       SET name = ?, company = ?, mobile = ?, address = ?, debts = ?
       WHERE id = ?`,
      [
        name.trim(),
        company?.trim() || null,
        mobile?.trim() || null,
        address?.trim() || null,
        debts,
        id
      ]
    );
    
    const [updated] = await pool.query(
      `SELECT 
        id,
        name,
        company,
        mobile,
        address,
        debts,
        created_at as createdAt
      FROM party_debts 
      WHERE id = ?`,
      [id]
    );
    
    res.json({
      success: true,
      data: updated[0],
      message: "Party debt record updated successfully"
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/party-debts/:id - Delete single party debt
router.delete("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if record exists
    const [existing] = await pool.query(
      "SELECT id FROM party_debts WHERE id = ?",
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: "Party debt record not found" 
      });
    }
    
    // Hard delete (as per frontend implementation)
    const [result] = await pool.query(
      "DELETE FROM party_debts WHERE id = ?",
      [id]
    );
    
    res.json({
      success: true,
      data: { deletedCount: result.affectedRows },
      message: "Party debt record deleted successfully"
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/party-debts - Bulk delete party debts
router.delete("/", authenticateToken, async (req, res, next) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: "Provide array of IDs to delete" 
      });
    }
    
    // Hard delete (as per frontend implementation)
    const [result] = await pool.query(
      "DELETE FROM party_debts WHERE id IN (?)",
      [ids]
    );
    
    res.json({
      success: true,
      data: { deletedCount: result.affectedRows },
      message: `${result.affectedRows} party debt record(s) deleted successfully`
    });
  } catch (err) {
    next(err);
  }
});

export default router;