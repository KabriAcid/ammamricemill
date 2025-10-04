import { Router } from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = Router();

// GET /api/party/parties - Fetch all parties
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const { status } = req.query;

    let query = `
      SELECT 
        p.id,
        p.name,
        p.type_id as typeId,
        pt.name as typeName,
        p.phone,
        p.address,
        p.balance,
        p.status,
        p.created_at as createdAt
      FROM parties p
      LEFT JOIN party_types pt ON p.type_id = pt.id
    `;

    const params = [];

    if (status) {
      query += " WHERE p.status = ?";
      params.push(status);
    } else {
      query += " WHERE p.status = 'active'";
    }

    query += " ORDER BY p.name ASC";

    const [parties] = await pool.query(query, params);

    res.json({
      success: true,
      data: parties,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/party/parties/:id - Get single party details
router.get("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const [parties] = await pool.query(
      `SELECT 
        p.id,
        p.name,
        p.type_id as typeId,
        pt.name as typeName,
        p.phone,
        p.address,
        p.balance,
        p.status,
        p.created_at as createdAt
      FROM parties p
      LEFT JOIN party_types pt ON p.type_id = pt.id
      WHERE p.id = ?`,
      [id]
    );

    if (!parties.length) {
      return res.status(404).json({
        success: false,
        message: "Party not found",
      });
    }

    res.json({
      success: true,
      data: parties[0],
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/party/parties - Create new party
router.post("/", authenticateToken, async (req, res, next) => {
  try {
    const { name, typeId, phone, address, balance } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Party name is required",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO parties (name, type_id, phone, address, balance, status) 
       VALUES (?, ?, ?, ?, ?, 'active')`,
      [name, typeId || null, phone || null, address || null, balance || 0]
    );

    const [newParty] = await pool.query(
      `SELECT 
        p.id,
        p.name,
        p.type_id as typeId,
        pt.name as typeName,
        p.phone,
        p.address,
        p.balance,
        p.status,
        p.created_at as createdAt
      FROM parties p
      LEFT JOIN party_types pt ON p.type_id = pt.id
      WHERE p.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      data: newParty[0],
      message: "Party created successfully",
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/party/parties/:id - Update party
router.put("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, typeId, phone, address, balance, status } = req.body;

    if (!name) {
      return res.status(400).json({
        success: false,
        message: "Party name is required",
      });
    }

    // Check if party exists
    const [existing] = await pool.query("SELECT id FROM parties WHERE id = ?", [
      id,
    ]);

    if (!existing.length) {
      return res.status(404).json({
        success: false,
        message: "Party not found",
      });
    }

    await pool.query(
      `UPDATE parties 
       SET name = ?, type_id = ?, phone = ?, address = ?, balance = ?, status = ?
       WHERE id = ?`,
      [
        name,
        typeId || null,
        phone || null,
        address || null,
        balance || 0,
        status || "active",
        id,
      ]
    );

    const [updated] = await pool.query(
      `SELECT 
        p.id,
        p.name,
        p.type_id as typeId,
        pt.name as typeName,
        p.phone,
        p.address,
        p.balance,
        p.status,
        p.created_at as createdAt
      FROM parties p
      LEFT JOIN party_types pt ON p.type_id = pt.id
      WHERE p.id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: updated[0],
      message: "Party updated successfully",
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/party/parties - Bulk delete parties
router.delete("/", authenticateToken, async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide an array of party IDs to delete",
      });
    }

    const [result] = await pool.query(`DELETE FROM parties WHERE id IN (?)`, [
      ids,
    ]);

    res.json({
      success: true,
      data: { deletedCount: result.affectedRows },
      message: `${result.affectedRows} party(ies) deleted successfully`,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
