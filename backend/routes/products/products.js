import { Router } from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = Router();

// GET /api/products - Fetch all products
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const [records] = await pool.query(`
      SELECT 
        p.id,
        p.name,
        p.category_id,
        c.name as category,
        p.unit,
        p.price as salePrice,
        p.status,
        p.created_at as createdAt
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.status = 'active'
      ORDER BY p.created_at DESC
    `);

    // Add missing fields that frontend expects but DB doesn't have
    const productsWithExtras = records.map((record) => ({
      ...record,
      type: record.type || "",
      size: record.size || "",
      weight: record.weight || 0,
      buyPrice: record.buy_price || 0,
    }));

    res.json({ success: true, data: productsWithExtras });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/:id - Fetch single product
router.get("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const [records] = await pool.query(
      `SELECT 
        p.id,
        p.name,
        p.category_id,
        c.name as category,
        p.unit,
        p.price as salePrice,
        p.status,
        p.created_at as createdAt
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ? AND p.status = 'active'`,
      [id]
    );

    if (records.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    const product = {
      ...records[0],
      type: records[0].type || "",
      size: records[0].size || "",
      weight: records[0].weight || 0,
      buyPrice: records[0].buy_price || 0,
    };

    res.json({ success: true, data: product });
  } catch (err) {
    next(err);
  }
});

// POST /api/products - Create new product
router.post("/", authenticateToken, async (req, res, next) => {
  try {
    const { category, name, unit, type, size, weight, buyPrice, salePrice } =
      req.body;

    // Validation
    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Product name is required",
      });
    }

    if (!unit || unit.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Unit is required",
      });
    }

    if (!category || category.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Category is required",
      });
    }

    // Find or validate category_id
    let categoryId = null;
    const [categoryRecords] = await pool.query(
      "SELECT id FROM categories WHERE name = ? AND status = 'active' LIMIT 1",
      [category.trim()]
    );

    if (categoryRecords.length > 0) {
      categoryId = categoryRecords[0].id;
    } else {
      return res.status(400).json({
        success: false,
        error: "Category not found. Please create the category first.",
      });
    }

    // Check for duplicate product name
    const [existing] = await pool.query(
      "SELECT id FROM products WHERE name = ? AND status = 'active'",
      [name.trim()]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Product name already exists",
      });
    }

    // Note: products table has limited columns (name, category_id, unit, price, status)
    // type, size, weight, buyPrice are not in the schema but frontend expects them
    const [result] = await pool.query(
      `INSERT INTO products (name, category_id, unit, price, status) 
       VALUES (?, ?, ?, ?, 'active')`,
      [name.trim(), categoryId, unit.trim(), salePrice || 0]
    );

    const [newRecord] = await pool.query(
      `SELECT 
        p.id,
        p.name,
        p.category_id,
        c.name as category,
        p.unit,
        p.price as salePrice,
        p.status,
        p.created_at as createdAt
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?`,
      [result.insertId]
    );

    const product = {
      ...newRecord[0],
      type: type || "",
      size: size || "",
      weight: weight || 0,
      buyPrice: buyPrice || 0,
    };

    res.status(201).json({
      success: true,
      data: product,
      message: "Product created successfully",
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/products/:id - Update product
router.put("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { category, name, unit, type, size, weight, buyPrice, salePrice } =
      req.body;

    // Check if record exists
    const [existing] = await pool.query(
      "SELECT id FROM products WHERE id = ? AND status = 'active'",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Validation
    if (!name || name.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Product name is required",
      });
    }

    if (!unit || unit.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Unit is required",
      });
    }

    if (!category || category.trim() === "") {
      return res.status(400).json({
        success: false,
        error: "Category is required",
      });
    }

    // Find category_id
    let categoryId = null;
    const [categoryRecords] = await pool.query(
      "SELECT id FROM categories WHERE name = ? AND status = 'active' LIMIT 1",
      [category.trim()]
    );

    if (categoryRecords.length > 0) {
      categoryId = categoryRecords[0].id;
    } else {
      return res.status(400).json({
        success: false,
        error: "Category not found. Please create the category first.",
      });
    }

    // Check for duplicate product name (excluding current record)
    const [duplicate] = await pool.query(
      "SELECT id FROM products WHERE name = ? AND id != ? AND status = 'active'",
      [name.trim(), id]
    );

    if (duplicate.length > 0) {
      return res.status(400).json({
        success: false,
        error: "Product name already exists",
      });
    }

    await pool.query(
      `UPDATE products 
       SET name = ?, category_id = ?, unit = ?, price = ?
       WHERE id = ?`,
      [name.trim(), categoryId, unit.trim(), salePrice || 0, id]
    );

    const [updated] = await pool.query(
      `SELECT 
        p.id,
        p.name,
        p.category_id,
        c.name as category,
        p.unit,
        p.price as salePrice,
        p.status,
        p.created_at as createdAt
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE p.id = ?`,
      [id]
    );

    const product = {
      ...updated[0],
      type: type || "",
      size: size || "",
      weight: weight || 0,
      buyPrice: buyPrice || 0,
    };

    res.json({
      success: true,
      data: product,
      message: "Product updated successfully",
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/products/:id - Delete single product (soft delete)
router.delete("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Check if record exists
    const [existing] = await pool.query(
      "SELECT id FROM products WHERE id = ? AND status = 'active'",
      [id]
    );

    if (existing.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Product not found",
      });
    }

    // Check for dependencies in related tables
    const [purchaseItems] = await pool.query(
      "SELECT id FROM purchase_items WHERE product_id = ? LIMIT 1",
      [id]
    );

    const [salesItems] = await pool.query(
      "SELECT id FROM sales_items WHERE product_id = ? LIMIT 1",
      [id]
    );

    const [stockMovements] = await pool.query(
      "SELECT id FROM stock_movements WHERE product_id = ? LIMIT 1",
      [id]
    );

    if (
      purchaseItems.length > 0 ||
      salesItems.length > 0 ||
      stockMovements.length > 0
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Cannot delete product. It is being used in purchases, sales, or stock movements",
      });
    }

    // Soft delete
    const [result] = await pool.query(
      "UPDATE products SET status = 'inactive' WHERE id = ?",
      [id]
    );

    res.json({
      success: true,
      data: { deletedCount: result.affectedRows },
      message: "Product deleted successfully",
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/products - Bulk delete products (soft delete)
router.delete("/", authenticateToken, async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Provide array of IDs to delete",
      });
    }

    // Check for dependencies in related tables
    const [purchaseItems] = await pool.query(
      "SELECT product_id FROM purchase_items WHERE product_id IN (?) LIMIT 1",
      [ids]
    );

    const [salesItems] = await pool.query(
      "SELECT product_id FROM sales_items WHERE product_id IN (?) LIMIT 1",
      [ids]
    );

    const [stockMovements] = await pool.query(
      "SELECT product_id FROM stock_movements WHERE product_id IN (?) LIMIT 1",
      [ids]
    );

    if (
      purchaseItems.length > 0 ||
      salesItems.length > 0 ||
      stockMovements.length > 0
    ) {
      return res.status(400).json({
        success: false,
        error:
          "Cannot delete one or more products. They are being used in purchases, sales, or stock movements",
      });
    }

    // Soft delete
    const [result] = await pool.query(
      "UPDATE products SET status = 'inactive' WHERE id IN (?)",
      [ids]
    );

    res.json({
      success: true,
      data: { deletedCount: result.affectedRows },
      message: `${result.affectedRows} product(s) deleted successfully`,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
