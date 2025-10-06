import express from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = express.Router();

// Using dedicated emptybag_receive table (migration created at schema/migrations/002_create_emptybag_receive.sql)

// GET /api/emptybag-receive
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      `SELECT r.id, r.date, r.invoice_no AS invoiceNo, r.party_id AS party_id, parties.name AS party, r.items, r.quantity, r.price, r.total_amount AS totalAmount, r.description
       FROM emptybag_receive r
       LEFT JOIN parties ON r.party_id = parties.id
       ORDER BY r.date DESC`
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
      `SELECT r.id, r.date, r.invoice_no AS invoiceNo, r.party_id AS party_id, parties.name AS party, r.items, r.quantity, r.price, r.total_amount AS totalAmount, r.description
       FROM emptybag_receive r
       LEFT JOIN parties ON r.party_id = parties.id
       WHERE r.id = ?`,
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
    const totalAmount = (quantity || 0) * (price || 0);
    const [result] = await pool.query(
      `INSERT INTO emptybag_receive (date, invoice_no, party_id, items, quantity, price, total_amount, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        date,
        invoiceNo,
        party_id || null,
        items || 0,
        quantity || 0,
        price || 0,
        totalAmount,
        description || "",
      ]
    );
    const [newRows] = await pool.query(
      `SELECT r.id, r.date, r.invoice_no AS invoiceNo, r.party_id AS party_id, parties.name AS party, r.items, r.quantity, r.price, r.total_amount AS totalAmount, r.description
       FROM emptybag_receive r
       LEFT JOIN parties ON r.party_id = parties.id
       WHERE r.id = ?`,
      [result.insertId]
    );
    res.status(201).json({
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
      `SELECT id FROM emptybag_receive WHERE id = ?`,
      [id]
    );
    if (existing.length === 0)
      return res.status(404).json({ success: false, message: "Not found" });
    const totalAmount = (quantity || 0) * (price || 0);
    await pool.query(
      `UPDATE emptybag_receive SET date = ?, invoice_no = ?, party_id = ?, items = ?, quantity = ?, price = ?, total_amount = ?, description = ? WHERE id = ?`,
      [
        date,
        invoiceNo,
        party_id || null,
        items || 0,
        quantity || 0,
        price || 0,
        totalAmount,
        description || "",
        id,
      ]
    );
    const [updatedRows] = await pool.query(
      `SELECT r.id, r.date, r.invoice_no AS invoiceNo, r.party_id AS party_id, parties.name AS party, r.items, r.quantity, r.price, r.total_amount AS totalAmount, r.description
       FROM emptybag_receive r
       LEFT JOIN parties ON r.party_id = parties.id
       WHERE r.id = ?`,
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
    await pool.query(`DELETE FROM emptybag_receive WHERE id = ?`, [id]);
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
    await pool.query(`DELETE FROM emptybag_receive WHERE id IN (?)`, [ids]);
    res.json({ success: true, message: "Receive orders deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
