import { Router } from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = Router();

// Get production details with pagination and filtering
router.get("/", authenticateToken, async (req, res) => {
  try {
    const {
      page = 1,
      pageSize = 25,
      search = "",
      fromDate,
      toDate,
    } = req.query;
    const offset = (page - 1) * pageSize;

    let query = `
      SELECT 
        pd.id,
        pd.production_id as productionId,
        DATE_FORMAT(pd.date, '%Y-%m-%d') as date,
        pd.quantity_produced as quantityProduced,
        pd.weight_produced as weightProduced,
        pd.status,
        pd.notes,
        pd.created_at as createdAt,
        pd.updated_at as updatedAt,
        po.invoice_no as productionInvoiceNo
        FROM production_details pd
        LEFT JOIN productions po ON pd.production_id = po.id
      WHERE 1=1
    `;

    if (search) {
      query += ` AND (po.invoice_no LIKE ? OR pd.notes LIKE ?)`;
    }

    if (fromDate) {
      query += ` AND pd.date >= ?`;
    }
    if (toDate) {
      query += ` AND pd.date <= ?`;
    }

    query += ` ORDER BY pd.date DESC, pd.id DESC LIMIT ? OFFSET ?`;

    const queryParams = [];
    if (search) {
      queryParams.push(`%${search}%`, `%${search}%`);
    }
    if (fromDate) {
      queryParams.push(fromDate);
    }
    if (toDate) {
      queryParams.push(toDate);
    }
    queryParams.push(Number(pageSize), offset);

    const [details] = await pool.query(query, queryParams);

    // Get total count
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM production_details pd
  LEFT JOIN productions po ON pd.production_id = po.id
       WHERE 1=1` +
        (search ? ` AND (po.invoice_no LIKE ? OR pd.notes LIKE ?)` : "") +
        (fromDate ? ` AND pd.date >= ?` : "") +
        (toDate ? ` AND pd.date <= ?` : ""),
      queryParams.slice(0, -2)
    );

    res.json({
      success: true,
      data: details,
      meta: {
        total: countResult[0].total,
        page: Number(page),
        pageSize: Number(pageSize),
      },
      message: "Production details retrieved successfully",
    });
  } catch (error) {
    console.error("Error retrieving production details:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// POST /api/production/production-details
// Add new production details
router.post("/", authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      productionId,
      date,
      quantityProduced,
      weightProduced,
      status,
      notes,
    } = req.body;

    // Validate required fields
    if (!productionId || !date || !quantityProduced || !weightProduced) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // Check if production exists
    const [productions] = await connection.query(
      "SELECT id FROM productions WHERE id = ?",
      [productionId]
    );

    if (!productions.length) {
      return res.status(404).json({
        success: false,
        error: "Production order not found",
      });
    }

    // Insert production details
    const [result] = await connection.query(
      `INSERT INTO production_details 
        (production_id, date, quantity_produced, weight_produced, status, notes)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [productionId, date, quantityProduced, weightProduced, status, notes]
    );

    // Update production total quantities
    await connection.query(
      `UPDATE productions 
       SET total_quantity = total_quantity + ?,
           total_weight = total_weight + ?
       WHERE id = ?`,
      [quantityProduced, weightProduced, productionId]
    );

    await connection.commit();

    res.status(201).json({
      success: true,
      data: { id: result.insertId },
      message: "Production details added successfully",
    });
  } catch (error) {
    await connection.rollback();
    console.error("Error adding production details:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  } finally {
    connection.release();
  }
});

// GET /api/production/production-details/:id
// Get specific production details
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const [details] = await pool.query(
      `SELECT 
        pd.id,
        pd.production_id as productionId,
        DATE_FORMAT(pd.date, '%Y-%m-%d') as date,
        pd.quantity_produced as quantityProduced,
        pd.weight_produced as weightProduced,
        pd.status,
        pd.notes,
        pd.created_at as createdAt,
        pd.updated_at as updatedAt,
        po.invoice_no as productionInvoiceNo
      FROM production_details pd
  LEFT JOIN productions po ON pd.production_id = po.id
      WHERE pd.id = ?`,
      [id]
    );

    if (!details.length) {
      return res.status(404).json({
        success: false,
        error: "Production details not found",
      });
    }

    res.json({
      success: true,
      data: details[0],
      message: "Production details retrieved successfully",
    });
  } catch (error) {
    console.error("Error retrieving production details:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// DELETE /api/production/production-details
// Delete multiple production details
router.delete("/", authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || !ids.length) {
      return res.status(400).json({
        success: false,
        error: "Please provide an array of IDs to delete",
      });
    }

    // Get production details to update production order totals
    const [details] = await connection.query(
      `SELECT production_id, quantity_produced, weight_produced 
       FROM production_details 
       WHERE id IN (?)`,
      [ids]
    );

    // Update production order totals
    for (const detail of details) {
      await connection.query(
        `UPDATE productions 
         SET total_quantity = total_quantity - ?,
             total_weight = total_weight - ?
         WHERE id = ?`,
        [detail.quantity_produced, detail.weight_produced, detail.production_id]
      );
    }

    // Delete production details
    const [result] = await connection.query(
      "DELETE FROM production_details WHERE id IN (?)",
      [ids]
    );

    await connection.commit();

    res.json({
      success: true,
      data: { deletedCount: result.affectedRows },
      message: `${result.affectedRows} production detail(s) deleted successfully`,
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error deleting production details:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
});

export default router;
