import { Router } from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = Router();

// GET /api/settings/godown/stats
router.get("/stats", authenticateToken, async (req, res, next) => {
  try {
    const [[stats]] = await pool.query(`
      SELECT 
        COUNT(*) as totalGodowns,
        COALESCE(SUM(capacity), 0) as totalCapacity,
        COALESCE(AVG(capacity), 0) as avgCapacity,
        (
          SELECT COUNT(*)
          FROM godowns g2
          WHERE g2.current_stock < (g2.capacity * 0.1)
        ) as lowStock
      FROM godowns g1
      WHERE status = 'active'
    `);

    res.json({
      success: true,
      data: {
        totalGodowns: stats.totalGodowns,
        totalCapacity: stats.totalCapacity,
        avgCapacity: stats.avgCapacity,
        lowStock: stats.lowStock,
      },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/settings/godown - Fetch all godowns
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const [godowns] = await pool.query(`
      SELECT 
        id,
        name,
        capacity,
        current_stock as currentStock,
        unit,
        location,
        manager,
        status,
        created_at as createdAt,
        updated_at as updatedAt
      FROM godowns 
      ORDER BY name ASC`);
    res.json({ success: true, data: godowns });
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

// POST /api/settings/godown - Create new godown
router.post("/", authenticateToken, async (req, res, next) => {
  try {
    const { name, capacity, unit, location, manager, description } = req.body;

    // Validation
    if (!name || !capacity) {
      return res.status(400).json({
        success: false,
        message: "Name and capacity are required",
      });
    }

    // Insert the new godown
    const [result] = await pool.query(
      `INSERT INTO godowns (
        name, capacity, current_stock, unit, location, 
        manager, description, status, created_at, updated_at
      ) VALUES (?, ?, 0, ?, ?, ?, ?, 'active', NOW(), NOW())`,
      [name, capacity, unit || "tons", location, manager, description]
    );

    // Fetch the newly created godown
    const [[godown]] = await pool.query(
      `SELECT 
        id,
        name,
        capacity,
        current_stock as currentStock,
        unit,
        location,
        manager,
        description,
        status,
        created_at as createdAt,
        updated_at as updatedAt
       FROM godowns 
       WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      data: godown,
      message: "Godown created successfully",
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/settings/godown/:id - Update godown
router.put("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, capacity, unit, location, manager, description, status } =
      req.body;

    // Validation
    if (!name || !capacity) {
      return res.status(400).json({
        success: false,
        message: "Name and capacity are required",
      });
    }

    const [result] = await pool.query(
      `UPDATE godowns 
       SET name=?, capacity=?, unit=?, location=?, manager=?, 
           description=?, status=?, updated_at=NOW()
       WHERE id=?`,
      [
        name,
        capacity,
        unit || "tons",
        location,
        manager,
        description,
        status || "active",
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Godown not found",
      });
    }

    // Fetch the updated godown
    const [[godown]] = await pool.query(
      `SELECT 
        id,
        name,
        capacity,
        current_stock as currentStock,
        unit,
        location,
        manager,
        description,
        status,
        created_at as createdAt,
        updated_at as updatedAt
       FROM godowns 
       WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: godown,
      message: "Godown updated successfully",
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/settings/godown - Delete multiple godowns
router.delete("/", authenticateToken, async (req, res, next) => {
  try {
    const { ids } = req.query;
    const godownIds = ids.split(",");

    if (!godownIds || godownIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Please provide godown IDs to delete",
      });
    }

    const [result] = await pool.query("DELETE FROM godowns WHERE id IN (?)", [
      godownIds,
    ]);

    res.json({
      success: true,
      data: {
        deletedCount: result.affectedRows,
      },
      message: `${result.affectedRows} godown(s) deleted successfully`,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
