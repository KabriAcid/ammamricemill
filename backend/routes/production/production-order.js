import { Router } from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = Router();

// GET /api/production/production-order
// Get all production orders with pagination and filtering
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

    // Base query for productions
    let query = `
      SELECT 
        p.id,
        p.invoice_no as invoiceNo,
        DATE_FORMAT(p.date, '%Y-%m-%d') as date,
        p.description,
        p.silo_info as siloInfo,
        p.total_quantity as totalQuantity,
        p.total_weight as totalWeight,
        p.status,
        p.created_at as createdAt,
        p.updated_at as updatedAt
  FROM productions p
      WHERE 1=1
    `;

    // Add search condition if provided
    if (search) {
      query += ` AND (p.invoice_no LIKE ? OR p.description LIKE ?)`;
    }

    // Add date range conditions if provided
    if (fromDate) {
      query += ` AND p.date >= ?`;
    }
    if (toDate) {
      query += ` AND p.date <= ?`;
    }

    // Add pagination
    query += ` ORDER BY p.date DESC, p.invoice_no DESC LIMIT ? OFFSET ?`;

    // Prepare query parameters
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

    // Execute query
    const [productions] = await pool.query(query, queryParams);

    // For each production, fetch its items
    for (let production of productions) {
      const [items] = await pool.query(
        `SELECT 
          pi.id,
          pi.category_id as categoryId,
          pi.product_id as productId,
          pi.godown_id as godownId,
          pi.silo_id as siloId,
          pi.quantity,
          pi.net_weight as netWeight
        FROM production_items pi
        WHERE pi.production_id = ?`,
        [production.id]
      );
      production.items = items;
    }

    // Get total count for pagination
    const [countResult] = await pool.query(
      `SELECT COUNT(*) as total FROM productions WHERE 1=1` +
        (search ? ` AND (invoice_no LIKE ? OR description LIKE ?)` : "") +
        (fromDate ? ` AND date >= ?` : "") +
        (toDate ? ` AND date <= ?` : ""),
      queryParams.slice(0, -2) // Remove limit and offset
    );

    res.json({
      success: true,
      data: productions,
      meta: {
        total: countResult[0].total,
        page: Number(page),
        pageSize: Number(pageSize),
      },
      message: "Production orders retrieved successfully",
    });
  } catch (error) {
    console.error("Error retrieving production orders:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// POST /api/production/production-order
// Create a new production order
router.post("/", authenticateToken, async (req, res) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const {
      invoiceNo,
      date,
      description,
      siloInfo,
      items,
      totalQuantity,
      totalWeight,
    } = req.body;

    // Validate required fields
    if (!invoiceNo || !date || !items || !items.length) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields",
      });
    }

    // Some dumps don't have AUTO_INCREMENT on id — create an explicit id
    const [nextIdRow] = await connection.query(
      `SELECT COALESCE(MAX(id), 0) + 1 as nextId FROM productions FOR UPDATE`
    );
    const productionId = nextIdRow[0].nextId;

    // Insert production order with explicit id
    await connection.query(
      `INSERT INTO productions 
        (id, invoice_no, date, description, silo_info, total_quantity, total_weight, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, 'active')`,
      [
        productionId,
        invoiceNo,
        date,
        description,
        siloInfo,
        totalQuantity,
        totalWeight,
      ]
    );

    // Insert production items
    for (const item of items) {
      await connection.query(
        `INSERT INTO production_items 
          (production_id, category_id, product_id, godown_id, silo_id, quantity, net_weight)
        VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          productionId,
          item.categoryId,
          item.productId,
          item.godownId,
          item.siloId,
          item.quantity,
          item.netWeight,
        ]
      );
    }

    await connection.commit();

    res.status(201).json({
      success: true,
      data: { id: productionId },
      message: "Production created successfully",
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error creating production order:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
});

// GET /api/production/production-order/:id
// Get a specific production order by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Get production order
    const [productions] = await pool.query(
      `SELECT 
        p.id,
        p.invoice_no as invoiceNo,
        DATE_FORMAT(p.date, '%Y-%m-%d') as date,
        p.description,
        p.silo_info as siloInfo,
        p.total_quantity as totalQuantity,
        p.total_weight as totalWeight,
        p.status,
        p.created_at as createdAt,
        p.updated_at as updatedAt
      FROM productions p
      WHERE p.id = ?`,
      [id]
    );

    if (!productions.length) {
      return res.status(404).json({
        success: false,
        error: "Production order not found",
      });
    }

    const production = productions[0];

    // Get production items
    const [items] = await pool.query(
      `SELECT 
        pi.id,
        pi.category_id as categoryId,
        pi.product_id as productId,
        pi.godown_id as godownId,
        pi.silo_id as siloId,
        pi.quantity,
        pi.net_weight as netWeight
      FROM production_items pi
      WHERE pi.production_id = ?`,
      [id]
    );

    production.items = items;

    res.json({
      success: true,
      data: production,
      message: "Production retrieved successfully",
    });
  } catch (error) {
    console.error("Error retrieving production order:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

// DELETE /api/production/production-order
// Delete multiple production orders
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

    // Delete production items first (foreign key constraint)
    await connection.query(
      "DELETE FROM production_items WHERE production_id IN (?)",
      [ids]
    );

    // Delete production orders
    const [result] = await connection.query(
      "DELETE FROM productions WHERE id IN (?)",
      [ids]
    );

    await connection.commit();

    res.json({
      success: true,
      data: { deletedCount: result.affectedRows },
      message: `${result.affectedRows} production order(s) deleted successfully`,
    });
  } catch (error) {
    if (connection) await connection.rollback();
    console.error("Error deleting production orders:", error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  } finally {
    if (connection) connection.release();
  }
});

export default router;
