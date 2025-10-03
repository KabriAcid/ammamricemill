import { Router } from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = Router();

// GET /api/settings/silo/stats
router.get("/stats", authenticateToken, async (req, res, next) => {
  try {
    const [[stats]] = await pool.query(`
      SELECT 
        COUNT(*) as totalSilos,
        COALESCE(SUM(capacity), 0) as totalCapacity,
        COALESCE(AVG(capacity), 0) as avgCapacity,
        (
          SELECT COUNT(*)
          FROM silos s2
          WHERE s2.capacity < (SELECT AVG(capacity) * 0.1 FROM silos)
        ) as lowCapacity
      FROM silos s1
    `);

    res.json({
      success: true,
      data: {
        totalSilos: stats.totalSilos,
        totalCapacity: stats.totalCapacity,
        avgCapacity: stats.avgCapacity,
        lowCapacity: stats.lowCapacity,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/settings/silo - Fetch all silos
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const [silos] = await pool.query(
      `SELECT 
        id,
        name,
        capacity,
        description,
        created_at as createdAt,
        updated_at as updatedAt
      FROM silos
      ORDER BY name ASC`
    );

    res.json({
      success: true,
      data: silos,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/settings/silo - Create new silo
router.post("/", authenticateToken, async (req, res, next) => {
  try {
    const { name, capacity, description } = req.body;

    // Validation
    if (!name || !capacity) {
      return res.status(400).json({
        success: false,
        message: "Name and capacity are required",
      });
    }

    // Insert the new silo
    const [result] = await pool.query(
      `INSERT INTO silos (name, capacity, description)
       VALUES (?, ?, ?)`,
      [name, capacity, description || null]
    );

    // Fetch the newly created silo
    const [[silo]] = await pool.query(
      `SELECT 
        id,
        name,
        capacity,
        description,
        created_at as createdAt,
        updated_at as updatedAt
       FROM silos 
       WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      data: silo,
      message: "Silo created successfully",
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/settings/silo/:id - Update silo
router.put("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, capacity, description } = req.body;

    // Validation
    if (!name || !capacity) {
      return res.status(400).json({
        success: false,
        message: "Name and capacity are required",
      });
    }

    const [result] = await pool.query(
      `UPDATE silos 
       SET name = ?, capacity = ?, description = ?, updated_at = NOW()
       WHERE id = ?`,
      [name, capacity, description, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Silo not found",
      });
    }

    // Fetch the updated silo
    const [[silo]] = await pool.query(
      `SELECT 
        id,
        name,
        capacity,
        description,
        created_at as createdAt,
        updated_at as updatedAt
       FROM silos 
       WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: silo,
      message: "Silo updated successfully",
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/settings/silo - Delete multiple silos
router.delete("/", authenticateToken, async (req, res, next) => {
  try {
    const { ids } = req.query;
    const siloIds = ids.split(",");

    if (!siloIds || siloIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide silo IDs to delete",
      });
    }

    const [result] = await pool.query("DELETE FROM silos WHERE id IN (?)", [
      siloIds,
    ]);

    res.json({
      success: true,
      data: {
        deletedCount: result.affectedRows,
      },
      message: `${result.affectedRows} silo(s) deleted successfully`,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
