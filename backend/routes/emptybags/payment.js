import express from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = express.Router();

// GET list
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const { from_date, to_date } = req.query;
    let query = `SELECT ep.id, ep.date, ep.invoice_no AS invoiceNo, ep.party_id AS partyId, parties.name AS partyName, ep.items, ep.quantity, ep.amount, ep.payment_mode AS paymentMode, ep.reference_no AS referenceNo, ep.description, ep.created_at AS createdAt FROM emptybag_payments ep LEFT JOIN parties ON ep.party_id = parties.id`;
    const params = [];
    if (from_date || to_date) {
      query += ` WHERE 1=1`;
      if (from_date) {
        query += ` AND ep.date >= ?`;
        params.push(from_date);
      }
      if (to_date) {
        query += ` AND ep.date <= ?`;
        params.push(to_date);
      }
    }
    query += ` ORDER BY ep.date DESC`;
    const [rows] = await pool.query(query, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
});

// POST create
router.post("/", authenticateToken, async (req, res, next) => {
  try {
    const {
      date,
      invoiceNo,
      partyId,
      items,
      quantity,
      amount,
      paymentMode,
      referenceNo,
      description,
    } = req.body;
    if (!date || !invoiceNo)
      return res
        .status(400)
        .json({ success: false, message: "Date and invoiceNo required" });
    const [result] = await pool.query(
      `INSERT INTO emptybag_payments (date, invoice_no, party_id, items, quantity, amount, payment_mode, reference_no, description) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        date,
        invoiceNo,
        partyId || null,
        items || 0,
        quantity || 0,
        amount || 0,
        paymentMode || "cash",
        referenceNo || null,
        description || "",
      ]
    );
    const [newRows] = await pool.query(
      `SELECT ep.id, ep.date, ep.invoice_no AS invoiceNo, ep.party_id AS partyId, parties.name AS partyName, ep.items, ep.quantity, ep.amount, ep.payment_mode AS paymentMode, ep.reference_no AS referenceNo, ep.description, ep.created_at AS createdAt FROM emptybag_payments ep LEFT JOIN parties ON ep.party_id = parties.id WHERE ep.id = ?`,
      [result.insertId]
    );
    res
      .status(201)
      .json({ success: true, data: newRows[0], message: "Payment created" });
  } catch (err) {
    next(err);
  }
});

// PUT update
router.put("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      date,
      invoiceNo,
      partyId,
      items,
      quantity,
      amount,
      paymentMode,
      referenceNo,
      description,
    } = req.body;
    const [existing] = await pool.query(
      `SELECT id FROM emptybag_payments WHERE id = ?`,
      [id]
    );
    if (!existing.length)
      return res.status(404).json({ success: false, message: "Not found" });
    await pool.query(
      `UPDATE emptybag_payments SET date = ?, invoice_no = ?, party_id = ?, items = ?, quantity = ?, amount = ?, payment_mode = ?, reference_no = ?, description = ? WHERE id = ?`,
      [
        date,
        invoiceNo,
        partyId || null,
        items || 0,
        quantity || 0,
        amount || 0,
        paymentMode || "cash",
        referenceNo || null,
        description || "",
        id,
      ]
    );
    const [rows] = await pool.query(
      `SELECT ep.id, ep.date, ep.invoice_no AS invoiceNo, ep.party_id AS partyId, parties.name AS partyName, ep.items, ep.quantity, ep.amount, ep.payment_mode AS paymentMode, ep.reference_no AS referenceNo, ep.description, ep.created_at AS createdAt FROM emptybag_payments ep LEFT JOIN parties ON ep.party_id = parties.id WHERE ep.id = ?`,
      [id]
    );
    res.json({ success: true, data: rows[0], message: "Payment updated" });
  } catch (err) {
    next(err);
  }
});

// DELETE single
router.delete("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query(`DELETE FROM emptybag_payments WHERE id = ?`, [id]);
    res.json({ success: true, message: "Payment deleted" });
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
        .json({ success: false, message: "Provide array of IDs" });
    await pool.query(`DELETE FROM emptybag_payments WHERE id IN (?)`, [ids]);
    res.json({ success: true, message: "Payments deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
