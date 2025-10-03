import { Router } from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = Router();

// GET /api/party/types
router.get("/", authenticateToken, async (req, res) => {
  try {
    const { search = "" } = req.query;

    let query = `
      SELECT 
        id,
        name,
        description,
        created_at as createdAt,
        updated_at as updatedAt
      FROM party_types
      WHERE 1=1
    `;

    const params = [];
    if (search) {
      query += ` AND (name LIKE ? OR description LIKE ?)`;
      params.push(`%${search}%`, `%${search}%`);
    }

    query += ` ORDER BY created_at DESC`;

    const [partyTypes] = await pool.query(query, params);

    res.json({
      success: true,
      data: partyTypes,
      message: "Party types retrieved successfully",
    });
  } catch (error) {
    console.error("Error retrieving party types:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// POST /api/party/types
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Name is required",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO party_types (name, description) VALUES (?, ?)`,
      [name, description]
    );

    const [newType] = await pool.query(
      `SELECT 
        id,
        name,
        description,
        created_at as createdAt,
        updated_at as updatedAt
      FROM party_types WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      data: newType[0],
      message: "Party type created successfully",
    });
  } catch (error) {
    console.error("Error creating party type:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// PUT /api/party/types/:id
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;
    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Name is required",
      });
    }

    const [existing] = await pool.query(
      "SELECT id FROM party_types WHERE id = ?",
      [id]
    );

    if (!existing.length) {
      return res.status(404).json({
        success: false,
        error: "Party type not found",
      });
    }

    await pool.query(
      `UPDATE party_types 
       SET name = ?, description = ?, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [name, description, id]
    );

    const [updated] = await pool.query(
      `SELECT 
        id,
        name,
        description,
        created_at as createdAt,
        updated_at as updatedAt
      FROM party_types WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: updated[0],
      message: "Party type updated successfully",
    });
  } catch (error) {
    console.error("Error updating party type:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// DELETE /api/party/types (bulk delete)
router.delete("/", authenticateToken, async (req, res) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || !ids.length) {
      return res.status(400).json({
        success: false,
        error: "Please provide an array of IDs to delete",
      });
    }

    const [result] = await pool.query(
      "DELETE FROM party_types WHERE id IN (?)",
      [ids]
    );

    res.json({
      success: true,
      data: { deletedCount: result.affectedRows },
      message: `${result.affectedRows} party type(s) deleted successfully`,
    });
  } catch (error) {
    console.error("Error deleting party types:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

export default router;
