import express from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = express.Router();

// GET /api/emptybag-purchases - List all purchases
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, date, invoice_no AS invoiceNo, party, items, quantity, price, description FROM emptybag_purchases ORDER BY date DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/emptybag-purchases/:id - Get single purchase
router.get("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT id, date, invoice_no AS invoiceNo, party, items, quantity, price, description FROM emptybag_purchases WHERE id = ?`,
      [id]
    );
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
});

// POST /api/emptybag-purchases - Create purchase
router.post("/", authenticateToken, async (req, res, next) => {
  try {
    const { date, invoiceNo, party, items, quantity, price, description } =
      req.body;
    if (!date || !invoiceNo || !party) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Date, invoiceNo, and party are required",
        });
    }
    const [result] = await pool.query(
      `INSERT INTO emptybag_purchases (date, invoice_no, party, items, quantity, price, description) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        date,
        invoiceNo,
        party,
        items || 0,
        quantity || 0,
        price || 0,
        description || "",
      ]
    );
    const [newRows] = await pool.query(
      `SELECT id, date, invoice_no AS invoiceNo, party, items, quantity, price, description FROM emptybag_purchases WHERE id = ?`,
      [result.insertId]
    );
    res
      .status(201)
      .json({
        success: true,
        data: newRows[0],
        message: "Purchase created successfully",
      });
  } catch (err) {
    next(err);
  }
});

// PUT /api/emptybag-purchases/:id - Update purchase
router.put("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, invoiceNo, party, items, quantity, price, description } =
      req.body;
    const [existing] = await pool.query(
      `SELECT id FROM emptybag_purchases WHERE id = ?`,
      [id]
    );
    if (existing.length === 0) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    await pool.query(
      `UPDATE emptybag_purchases SET date = ?, invoice_no = ?, party = ?, items = ?, quantity = ?, price = ?, description = ? WHERE id = ?`,
      [
        date,
        invoiceNo,
        party,
        items || 0,
        quantity || 0,
        price || 0,
        description || "",
        id,
      ]
    );
    const [updatedRows] = await pool.query(
      `SELECT id, date, invoice_no AS invoiceNo, party, items, quantity, price, description FROM emptybag_purchases WHERE id = ?`,
      [id]
    );
    res.json({
      success: true,
      data: updatedRows[0],
      message: "Purchase updated successfully",
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/emptybag-purchases/:id - Delete single purchase
router.delete("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM emptybag_purchases WHERE id = ?`, [id]);
    res.json({ success: true, message: "Purchase deleted successfully" });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/emptybag-purchases - Bulk delete
router.delete("/", authenticateToken, async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "Provide array of IDs to delete" });
    }
    await pool.query(`DELETE FROM emptybag_purchases WHERE id IN (?)`, [ids]);
    res.json({ success: true, message: "Purchases deleted successfully" });
  } catch (err) {
    next(err);
  }
});

export default router;
