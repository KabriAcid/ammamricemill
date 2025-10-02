import { Router } from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = Router();

// GET /api/hr/designation - Fetch all designations
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    // Get all designations - frontend handles search/filter/pagination
    const [designations] = await pool.query(
      `SELECT 
        id, 
        name, 
        description,
        created_at as createdAt,
        created_at as updatedAt
      FROM designations 
      WHERE status = 'active'
      ORDER BY created_at DESC`
    );

    res.json({
      success: true,
      data: designations,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/hr/designation/:id - Fetch single designation by ID
router.get("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const [designations] = await pool.query(
      `SELECT 
        id, 
        name, 
        description,
        created_at as createdAt,
        created_at as updatedAt
      FROM designations 
      WHERE id = ?`,
      [id]
    );

    if (designations.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Designation not found",
      });
    }

    res.json({
      success: true,
      data: designations[0],
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/hr/designation - Create new designation
router.post("/", authenticateToken, async (req, res, next) => {
  try {
    const { name, description } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Designation name is required",
      });
    }

    // Check for duplicate name
    const [[existing]] = await pool.query(
      "SELECT id FROM designations WHERE name = ? AND status = 'active'",
      [name]
    );

    if (existing) {
      return res.status(400).json({
        success: false,
        error: "Designation with this name already exists",
      });
    }

    // Insert new designation
    const [result] = await pool.query(
      `INSERT INTO designations (name, description, status) 
       VALUES (?, ?, 'active')`,
      [name, description || null]
    );

    // Fetch the newly created designation
    const [newDesignation] = await pool.query(
      `SELECT 
        id, 
        name, 
        description,
        created_at as createdAt,
        created_at as updatedAt
      FROM designations 
      WHERE id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      data: newDesignation[0],
      message: "Designation created successfully",
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/hr/designation/:id - Update existing designation
router.put("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description } = req.body;

    // Validation
    if (!name) {
      return res.status(400).json({
        success: false,
        error: "Designation name is required",
      });
    }

    // Check if designation exists
    const [[existingDesignation]] = await pool.query(
      "SELECT id FROM designations WHERE id = ?",
      [id]
    );

    if (!existingDesignation) {
      return res.status(404).json({
        success: false,
        error: "Designation not found",
      });
    }

    // Check for duplicate name (excluding current designation)
    const [[duplicate]] = await pool.query(
      "SELECT id FROM designations WHERE name = ? AND id != ? AND status = 'active'",
      [name, id]
    );

    if (duplicate) {
      return res.status(400).json({
        success: false,
        error: "Designation with this name already exists",
      });
    }

    // Update designation
    await pool.query(
      `UPDATE designations 
       SET name = ?, description = ?
       WHERE id = ?`,
      [name, description || null, id]
    );

    // Fetch updated designation
    const [updatedDesignation] = await pool.query(
      `SELECT 
        id, 
        name, 
        description,
        created_at as createdAt,
        created_at as updatedAt
      FROM designations 
      WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: updatedDesignation[0],
      message: "Designation updated successfully",
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/hr/designation - Delete designation(s) - supports bulk delete
router.delete("/", authenticateToken, async (req, res, next) => {
  try {
    const { ids } = req.body;

    // Validation
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Please provide an array of designation IDs to delete",
      });
    }

    // Check if any designation is assigned to employees
    const [assignedEmployees] = await pool.query(
      `SELECT designation_id 
       FROM employees 
       WHERE designation_id IN (?) AND status = 'active'
       LIMIT 1`,
      [ids]
    );

    if (assignedEmployees.length > 0) {
      return res.status(400).json({
        success: false,
        error:
          "Cannot delete designation(s) that are assigned to active employees",
      });
    }

    // Check if designations exist
    const [existingDesignations] = await pool.query(
      `SELECT id FROM designations WHERE id IN (?)`,
      [ids]
    );

    if (existingDesignations.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No designations found with the provided IDs",
      });
    }

    // Soft delete - mark as inactive instead of hard delete
    const [result] = await pool.query(
      `UPDATE designations 
       SET status = 'inactive' 
       WHERE id IN (?)`,
      [ids]
    );

    // Alternative: Hard delete (uncomment if needed)
    // const [result] = await pool.query(
    //   `DELETE FROM designations WHERE id IN (?)`,
    //   [ids]
    // );

    res.json({
      success: true,
      data: {
        deletedCount: result.affectedRows,
      },
      message: `${result.affectedRows} designation(s) deleted successfully`,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
