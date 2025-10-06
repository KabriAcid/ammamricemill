import express from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = express.Router();

// GET /api/emptybag-sales - List all sales (with party name)
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT s.id, s.date, s.invoice_no AS invoiceNo, s.party_id AS party_id, parties.name AS party, s.items, s.quantity, s.price, s.description
			 FROM emptybag_sales s
			 LEFT JOIN parties ON s.party_id = parties.id
			 ORDER BY s.date DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
});

// GET /api/emptybag-sales/:id - Get single sale
router.get("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT s.id, s.date, s.invoice_no AS invoiceNo, s.party_id AS party_id, parties.name AS party, s.items, s.quantity, s.price, s.description
			 FROM emptybag_sales s
			 LEFT JOIN parties ON s.party_id = parties.id
			 WHERE s.id = ?`,
      [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
});

// POST /api/emptybag-sales - Create sale
router.post("/", authenticateToken, async (req, res, next) => {
  try {
    const { date, invoiceNo, party_id, items, quantity, price, description } =
      req.body;
    if (!date || !invoiceNo || !party_id) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Date, invoiceNo, and party_id are required",
        });
    }
    const [result] = await pool.query(
      `INSERT INTO emptybag_sales (date, invoice_no, party_id, items, quantity, price, description) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        date,
        invoiceNo,
        party_id,
        items || 0,
        quantity || 0,
        price || 0,
        description || "",
      ]
    );
    const [newRows] = await pool.query(
      `SELECT s.id, s.date, s.invoice_no AS invoiceNo, s.party_id AS party_id, parties.name AS party, s.items, s.quantity, s.price, s.description
			 FROM emptybag_sales s
			 LEFT JOIN parties ON s.party_id = parties.id
			 WHERE s.id = ?`,
      [result.insertId]
    );
    res
      .status(201)
      .json({
        success: true,
        data: newRows[0],
        message: "Sale created successfully",
      });
  } catch (err) {
    next(err);
  }
});

// PUT /api/emptybag-sales/:id - Update sale
router.put("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, invoiceNo, party_id, items, quantity, price, description } =
      req.body;
    const [existing] = await pool.query(
      `SELECT id FROM emptybag_sales WHERE id = ?`,
      [id]
    );
    if (existing.length === 0)
      return res.status(404).json({ success: false, message: "Not found" });
    await pool.query(
      `UPDATE emptybag_sales SET date = ?, invoice_no = ?, party_id = ?, items = ?, quantity = ?, price = ?, description = ? WHERE id = ?`,
      [
        date,
        invoiceNo,
        party_id,
        items || 0,
        quantity || 0,
        price || 0,
        description || "",
        id,
      ]
    );
    const [updatedRows] = await pool.query(
      `SELECT s.id, s.date, s.invoice_no AS invoiceNo, s.party_id AS party_id, parties.name AS party, s.items, s.quantity, s.price, s.description
			 FROM emptybag_sales s
			 LEFT JOIN parties ON s.party_id = parties.id
			 WHERE s.id = ?`,
      [id]
    );
    res.json({
      success: true,
      data: updatedRows[0],
      message: "Sale updated successfully",
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/emptybag-sales/:id - Delete single sale
router.delete("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM emptybag_sales WHERE id = ?`, [id]);
    res.json({ success: true, message: "Sale deleted successfully" });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/emptybag-sales - Bulk delete
router.delete("/", authenticateToken, async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0)
      return res
        .status(400)
        .json({ success: false, message: "Provide array of IDs to delete" });
    await pool.query(`DELETE FROM emptybag_sales WHERE id IN (?)`, [ids]);
    res.json({ success: true, message: "Sales deleted successfully" });
  } catch (err) {
    next(err);
  }
});

export default router;
