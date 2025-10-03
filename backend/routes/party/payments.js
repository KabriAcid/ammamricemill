import { Router } from "express";
import { pool } from "../utils/db.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = Router();

// GET /api/party-payments - Fetch all party payments
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const [records] = await pool.query(`
      SELECT 
        pp.id,
        pp.date,
        pp.type,
        pp.head,
        pp.party_id,
        p.name as party,
        pp.description,
        pp.amount,
        pp.created_by as createdBy,
        u.name as createdByName,
        pp.created_at as createdAt
      FROM party_payments pp
      LEFT JOIN parties p ON pp.party_id = p.id
      LEFT JOIN users u ON pp.created_by = u.id
      WHERE pp.status = 'active'
      ORDER BY pp.date DESC, pp.created_at DESC
    `);
    
    res.json({ success: true, data: records });
  } catch (err) {
    next(err);
  }
});

// GET /api/party-payments/:id - Fetch single party payment
router.get("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const [records] = await pool.query(
      `SELECT 
        pp.id,
        pp.date,
        pp.type,
        pp.head,
        pp.party_id,
        p.name as party,
        pp.description,
        pp.amount,
        pp.created_by as createdBy,
        u.name as createdByName,
        pp.created_at as createdAt
      FROM party_payments pp
      LEFT JOIN parties p ON pp.party_id = p.id
      LEFT JOIN users u ON pp.created_by = u.id
      WHERE pp.id = ? AND pp.status = 'active'`,
      [id]
    );
    
    if (records.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: "Party payment not found" 
      });
    }
    
    res.json({ success: true, data: records[0] });
  } catch (err) {
    next(err);
  }
});

// POST /api/party-payments - Create new party payment
router.post("/", authenticateToken, async (req, res, next) => {
  try {
    const { date, type, head, party, description, amount } = req.body;
    const userId = req.user?.id; // From authenticateToken middleware
    
    // Validation
    if (!date) {
      return res.status(400).json({ 
        success: false, 
        error: "Date is required" 
      });
    }
    
    if (!type || type.trim() === "") {
      return res.status(400).json({ 
        success: false, 
        error: "Type is required" 
      });
    }
    
    if (!head || head.trim() === "") {
      return res.status(400).json({ 
        success: false, 
        error: "Head is required" 
      });
    }
    
    if (!party || party.trim() === "") {
      return res.status(400).json({ 
        success: false, 
        error: "Party is required" 
      });
    }
    
    if (amount === undefined || amount === null || amount < 0) {
      return res.status(400).json({ 
        success: false, 
        error: "Valid amount is required" 
      });
    }
    
    // Find or create party_id (assuming party is party name)
    // Note: Frontend sends party name, need to map to party_id
    let partyId = null;
    const [partyRecords] = await pool.query(
      "SELECT id FROM parties WHERE name = ? AND status = 'active' LIMIT 1",
      [party.trim()]
    );
    
    if (partyRecords.length > 0) {
      partyId = partyRecords[0].id;
    }
    // If party doesn't exist, you might want to create it or return error
    // For now, we'll allow NULL party_id if party not found
    
    const [result] = await pool.query(
      `INSERT INTO party_payments 
       (date, type, head, party_id, description, amount, created_by, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
      [
        date,
        type.trim(),
        head.trim(),
        partyId,
        description?.trim() || null,
        amount,
        userId || null
      ]
    );
    
    const [newRecord] = await pool.query(
      `SELECT 
        pp.id,
        pp.date,
        pp.type,
        pp.head,
        pp.party_id,
        p.name as party,
        pp.description,
        pp.amount,
        pp.created_by as createdBy,
        u.name as createdByName,
        pp.created_at as createdAt
      FROM party_payments pp
      LEFT JOIN parties p ON pp.party_id = p.id
      LEFT JOIN users u ON pp.created_by = u.id
      WHERE pp.id = ?`,
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      data: newRecord[0],
      message: "Party payment created successfully"
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/party-payments/:id - Update party payment
router.put("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, type, head, party, description, amount } = req.body;
    
    // Check if record exists
    const [existing] = await pool.query(
      "SELECT id FROM party_payments WHERE id = ? AND status = 'active'",
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: "Party payment not found" 
      });
    }
    
    // Validation
    if (!date) {
      return res.status(400).json({ 
        success: false, 
        error: "Date is required" 
      });
    }
    
    if (!type || type.trim() === "") {
      return res.status(400).json({ 
        success: false, 
        error: "Type is required" 
      });
    }
    
    if (!head || head.trim() === "") {
      return res.status(400).json({ 
        success: false, 
        error: "Head is required" 
      });
    }
    
    if (!party || party.trim() === "") {
      return res.status(400).json({ 
        success: false, 
        error: "Party is required" 
      });
    }
    
    if (amount === undefined || amount === null || amount < 0) {
      return res.status(400).json({ 
        success: false, 
        error: "Valid amount is required" 
      });
    }
    
    // Find party_id
    let partyId = null;
    const [partyRecords] = await pool.query(
      "SELECT id FROM parties WHERE name = ? AND status = 'active' LIMIT 1",
      [party.trim()]
    );
    
    if (partyRecords.length > 0) {
      partyId = partyRecords[0].id;
    }
    
    await pool.query(
      `UPDATE party_payments 
       SET date = ?, type = ?, head = ?, party_id = ?, description = ?, amount = ?
       WHERE id = ?`,
      [
        date,
        type.trim(),
        head.trim(),
        partyId,
        description?.trim() || null,
        amount,
        id
      ]
    );
    
    const [updated] = await pool.query(
      `SELECT 
        pp.id,
        pp.date,
        pp.type,
        pp.head,
        pp.party_id,
        p.name as party,
        pp.description,
        pp.amount,
        pp.created_by as createdBy,
        u.name as createdByName,
        pp.created_at as createdAt
      FROM party_payments pp
      LEFT JOIN parties p ON pp.party_id = p.id
      LEFT JOIN users u ON pp.created_by = u.id
      WHERE pp.id = ?`,
      [id]
    );
    
    res.json({
      success: true,
      data: updated[0],
      message: "Party payment updated successfully"
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/party-payments/:id - Delete single party payment (soft delete)
router.delete("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // Check if record exists
    const [existing] = await pool.query(
      "SELECT id FROM party_payments WHERE id = ? AND status = 'active'",
      [id]
    );
    
    if (existing.length === 0) {
      return res.status(404).json({ 
        success: false, 
        error: "Party payment not found" 
      });
    }
    
    // Soft delete
    const [result] = await pool.query(
      "UPDATE party_payments SET status = 'inactive' WHERE id = ?",
      [id]
    );
    
    res.json({
      success: true,
      data: { deletedCount: result.affectedRows },
      message: "Party payment deleted successfully"
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/party-payments - Bulk delete party payments (soft delete)
router.delete("/", authenticateToken, async (req, res, next) => {
  try {
    const { ids } = req.body;
    
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ 
        success: false, 
        error: "Provide array of IDs to delete" 
      });
    }
    
    // Soft delete
    const [result] = await pool.query(
      "UPDATE party_payments SET status = 'inactive' WHERE id IN (?)",
      [ids]
    );
    
    res.json({
      success: true,
      data: { deletedCount: result.affectedRows },
      message: `${result.affectedRows} party payment(s) deleted successfully`
    });
  } catch (err) {
    next(err);
  }
});

export default router;