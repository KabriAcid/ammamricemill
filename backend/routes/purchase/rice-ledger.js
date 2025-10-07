import { Router } from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = Router();

// GET /api/purchase/rice/ledger - list ledger entries with optional filters
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const { partyId, from, to } = req.query;

    let where = "p.status != 'cancelled'";
    const params = [];

    if (partyId) {
      where += " AND p.party_id = ?";
      params.push(partyId);
    }

    if (from && to) {
      where += " AND p.date BETWEEN ? AND ?";
      params.push(from, to);
    }

    const [purchases] = await pool.query(
      `SELECT p.id, p.date, p.invoice_no as invoiceNo, p.party_id as partyId, pt.name as partyName,
              p.total_quantity as totalQuantity, p.total_net_weight as totalNetWeight,
              p.invoice_amount as invoiceAmount, p.total_amount as totalAmount,
              p.paid_amount as paidAmount, p.current_balance as currentBalance
       FROM purchases p
       LEFT JOIN parties pt ON p.party_id = pt.id
       WHERE ${where}
       ORDER BY p.date ASC, p.id ASC`,
      params
    );

    // For each purchase, fetch its items
    const results = [];
    for (let i = 0; i < purchases.length; i++) {
      const p = purchases[i];
      const [items] = await pool.query(
        `SELECT pi.id, pi.product_id as productId, pi.godown_id as godownId, pi.quantity, pi.net_weight as netWeight, pi.rate, pi.total_price as totalPrice,
                pr.name as product, g.name as godown
         FROM purchase_items pi
         LEFT JOIN products pr ON pi.product_id = pr.id
         LEFT JOIN godowns g ON pi.godown_id = g.id
         WHERE pi.purchase_id = ?`,
        [p.id]
      );

      // Compute debit/credit: Here, treat purchases as debit (amount increases balance)
      const debit = p.totalAmount || 0;
      const credit = 0;
      const balance = p.currentBalance || 0;

      results.push({
        id: p.id.toString(),
        sl: i + 1,
        date: p.date,
        invoiceNo: p.invoiceNo,
        partyId: p.partyId,
        partyName: p.partyName,
        description: p.notes || "",
        items: items.map((it) => ({
          id: it.id,
          godown: it.godown,
          godownId: it.godownId,
          product: it.product,
          productId: it.productId,
          size: "",
          weight: it.netWeight,
          quantity: it.quantity,
          netWeight: it.netWeight,
          rate: it.rate,
          totalPrice: it.totalPrice,
        })),
        debit,
        credit,
        balance,
      });
    }

    res.json({ success: true, data: results });
  } catch (err) {
    next(err);
  }
});

// POST /api/purchase/rice/ledger - create a ledger entry (creates a purchase + items)
router.post("/", authenticateToken, async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      await connection.rollback();
      return res
        .status(400)
        .json({ success: false, error: "Items are required" });
    }

    const totalQuantity = items.reduce((s, it) => s + (it.quantity || 0), 0);
    const totalNetWeight = items.reduce((s, it) => s + (it.netWeight || 0), 0);
    const invoiceAmount = items.reduce((s, it) => s + (it.totalPrice || 0), 0);
    const totalAmount = invoiceAmount;
    const paidAmount = 0;
    const currentBalance = totalAmount - paidAmount;

    const invoiceNo = `LEDGER-${Date.now()}`;

    const [result] = await connection.query(
      `INSERT INTO purchases (date, invoice_no, total_quantity, total_net_weight, invoice_amount, total_amount, paid_amount, current_balance, status)
       VALUES (NOW(), ?, ?, ?, ?, ?, ?, ?, 'completed')`,
      [
        invoiceNo,
        totalQuantity,
        totalNetWeight,
        invoiceAmount,
        totalAmount,
        paidAmount,
        currentBalance,
      ]
    );

    const purchaseId = result.insertId;

    for (const it of items) {
      await connection.query(
        `INSERT INTO purchase_items (purchase_id, product_id, godown_id, quantity, net_weight, rate, total_price)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          purchaseId,
          it.productId || null,
          it.godownId || null,
          it.quantity || 0,
          it.netWeight || 0,
          it.rate || 0,
          it.totalPrice || 0,
        ]
      );
    }

    await connection.commit();

    // Return created entry
    res.status(201).json({
      success: true,
      data: { id: purchaseId.toString(), items },
      message: "Ledger entry created",
    });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
});

// PUT /api/purchase/rice/ledger/:id - update an existing ledger entry
router.put("/:id", authenticateToken, async (req, res, next) => {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const { items } = req.body;

    const [existing] = await connection.query(
      "SELECT id FROM purchases WHERE id = ?",
      [id]
    );
    if (existing.length === 0) {
      await connection.rollback();
      return res
        .status(404)
        .json({ success: false, error: "Ledger entry not found" });
    }

    // Replace items: delete old then insert new
    await connection.query("DELETE FROM purchase_items WHERE purchase_id = ?", [
      id,
    ]);

    for (const it of items || []) {
      await connection.query(
        `INSERT INTO purchase_items (purchase_id, product_id, godown_id, quantity, net_weight, rate, total_price)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          it.productId || null,
          it.godownId || null,
          it.quantity || 0,
          it.netWeight || 0,
          it.rate || 0,
          it.totalPrice || 0,
        ]
      );
    }

    await connection.commit();

    res.json({ success: true, data: { id }, message: "Ledger entry updated" });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
});

// GET /api/purchase/rice/ledger/export - export CSV
router.get("/export", authenticateToken, async (req, res, next) => {
  try {
    const { partyId, from, to, format } = req.query;

    // Build a simple CSV from purchases
    let where = "p.status != 'cancelled'";
    const params = [];
    if (partyId) {
      where += " AND p.party_id = ?";
      params.push(partyId);
    }
    if (from && to) {
      where += " AND p.date BETWEEN ? AND ?";
      params.push(from, to);
    }

    const [rows] = await pool.query(
      `SELECT p.id, p.date, p.invoice_no as invoiceNo, p.total_amount as totalAmount, p.current_balance as balance FROM purchases p WHERE ${where} ORDER BY p.date ASC`,
      params
    );

    const csvRows = ["ID,Date,Invoice No,Total Amount,Balance"];
    for (const r of rows) {
      csvRows.push(
        `${r.id},${r.date},${r.invoiceNo},${r.totalAmount || 0},${
          r.balance || 0
        }`
      );
    }

    const csv = csvRows.join("\n");
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="rice_ledger.csv"'
    );
    res.send(csv);
  } catch (err) {
    next(err);
  }
});

export default router;
