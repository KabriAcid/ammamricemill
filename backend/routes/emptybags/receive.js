import express from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = express.Router();

// NOTE: There is no dedicated emptybag_receive table in schema; reuse emptybag_purchases
// to represent received orders (fields match). This keeps DB unchanged and provides
// the Receive UX without migration. If you prefer a dedicated table, we can add a migration.

// GET /api/emptybag-receive
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT p.id, p.date, p.invoice_no AS invoiceNo, p.party_id AS party_id, parties.name AS party, p.items, p.quantity, p.price, p.description
       FROM emptybag_purchases p
       LEFT JOIN parties ON p.party_id = parties.id
       ORDER BY p.date DESC`
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
});

// GET single
router.get("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const [rows] = await pool.query(
      `SELECT p.id, p.date, p.invoice_no AS invoiceNo, p.party_id AS party_id, parties.name AS party, p.items, p.quantity, p.price, p.description
       FROM emptybag_purchases p
       LEFT JOIN parties ON p.party_id = parties.id
       WHERE p.id = ?`,
      [id]
    );
    if (rows.length === 0)
      return res.status(404).json({ success: false, message: "Not found" });
    res.json({ success: true, data: rows[0] });
  } catch (err) {
    next(err);
  }
});

// POST create
router.post("/", authenticateToken, async (req, res, next) => {
  try {
    const { date, invoiceNo, party_id, items, quantity, price, description } =
      req.body;
    if (!date || !invoiceNo)
      return res
        .status(400)
        .json({ success: false, message: "Date and invoiceNo required" });
    const [result] = await pool.query(
      `INSERT INTO emptybag_purchases (date, invoice_no, party_id, items, quantity, price, description) VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        date,
        invoiceNo,
        party_id || null,
        items || 0,
        quantity || 0,
        price || 0,
        description || "",
      ]
    );
    const [newRows] = await pool.query(
      `SELECT p.id, p.date, p.invoice_no AS invoiceNo, p.party_id AS party_id, parties.name AS party, p.items, p.quantity, p.price, p.description
       FROM emptybag_purchases p
       LEFT JOIN parties ON p.party_id = parties.id
       WHERE p.id = ?`,
      [result.insertId]
    );
    res
      .status(201)
      .json({
        success: true,
        data: newRows[0],
        message: "Receive order created",
      });
  } catch (err) {
    next(err);
  }
});

// PUT update
router.put("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, invoiceNo, party_id, items, quantity, price, description } =
      req.body;
    const [existing] = await pool.query(
      `SELECT id FROM emptybag_purchases WHERE id = ?`,
      [id]
    );
    if (existing.length === 0)
      return res.status(404).json({ success: false, message: "Not found" });
    await pool.query(
      `UPDATE emptybag_purchases SET date = ?, invoice_no = ?, party_id = ?, items = ?, quantity = ?, price = ?, description = ? WHERE id = ?`,
      [
        date,
        invoiceNo,
        party_id || null,
        items || 0,
        quantity || 0,
        price || 0,
        description || "",
        id,
      ]
    );
    const [updatedRows] = await pool.query(
      `SELECT p.id, p.date, p.invoice_no AS invoiceNo, p.party_id AS party_id, parties.name AS party, p.items, p.quantity, p.price, p.description
       FROM emptybag_purchases p
       LEFT JOIN parties ON p.party_id = parties.id
       WHERE p.id = ?`,
      [id]
    );
    res.json({
      success: true,
      data: updatedRows[0],
      message: "Receive order updated",
    });
  } catch (err) {
    next(err);
  }
});

// DELETE single
router.delete("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM emptybag_purchases WHERE id = ?`, [id]);
    res.json({ success: true, message: "Receive order deleted" });
  } catch (err) {
    next(err);
  }
});

// Bulk delete
router.delete("/", authenticateToken, async (req, res, next) => {
  try {
    const { ids } = req.body;
    if (!ids || !Array.isArray(ids) || ids.length === 0)
      return res
        .status(400)
        .json({ success: false, message: "Provide array of IDs to delete" });
    await pool.query(`DELETE FROM emptybag_purchases WHERE id IN (?)`, [ids]);
    res.json({ success: true, message: "Receive orders deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
