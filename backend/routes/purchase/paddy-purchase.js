import { Router } from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = Router();

// GET /api/purchase/paddy - Fetch all paddy purchases
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;

    let dateCondition = "p.status != 'cancelled'";
    const params = [];

    if (fromDate && toDate) {
      dateCondition += " AND p.date BETWEEN ? AND ?";
      params.push(fromDate, toDate);
    }

    // Get all purchases
    const [records] = await pool.query(
      `SELECT 
        p.id,
        p.date,
        p.invoice_no as invoiceNo,
        p.challan_no as challanNo,
        p.party_id as partyId,
        pt.name as partyName,
        p.transport_info as transportInfo,
        p.notes,
        p.total_quantity as totalQuantity,
        p.total_net_weight as totalNetWeight,
        p.invoice_amount as invoiceAmount,
        p.discount,
        p.total_amount as totalAmount,
        p.previous_balance as previousBalance,
        p.net_payable as netPayable,
        p.paid_amount as paidAmount,
        p.current_balance as currentBalance,
        p.payment_mode as paymentMode,
        p.reference_no as referenceNo,
        p.status,
        p.created_at as createdAt,
        p.updated_at as updatedAt
  FROM purchases p
      LEFT JOIN parties pt ON p.party_id = pt.id
      WHERE ${dateCondition}
      ORDER BY p.date DESC, p.created_at DESC`,
      params
    );

    res.json({
      success: true,
      data: records,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/purchase/paddy/:id - Fetch single paddy purchase with items
router.get("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Fetch purchase header
    const [purchases] = await pool.query(
      `SELECT 
        p.id,
        p.date,
        p.invoice_no as invoiceNo,
        p.challan_no as challanNo,
        p.party_id as partyId,
        pt.name as partyName,
        p.transport_info as transportInfo,
        p.notes,
        p.total_quantity as totalQuantity,
        p.total_net_weight as totalNetWeight,
        p.invoice_amount as invoiceAmount,
        p.discount,
        p.total_amount as totalAmount,
        p.previous_balance as previousBalance,
        p.net_payable as netPayable,
        p.paid_amount as paidAmount,
        p.current_balance as currentBalance,
        p.payment_mode as paymentMode,
        p.reference_no as referenceNo,
        p.status,
        p.created_at as createdAt,
        p.updated_at as updatedAt
  FROM purchases p
      LEFT JOIN parties pt ON p.party_id = pt.id
      WHERE p.id = ?`,
      [id]
    );

    if (purchases.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Purchase not found",
      });
    }

    // Fetch purchase items
    const [items] = await pool.query(
      `SELECT 
        pi.id,
        pi.category_id as categoryId,
        c.name as categoryName,
        pi.product_id as productId,
        pr.name as productName,
        pi.godown_id as godownId,
        g.name as godownName,
        pi.quantity,
        pi.net_weight as netWeight,
        pi.rate,
        pi.total_price as totalPrice,
        pi.created_at as createdAt
  FROM purchase_items pi
      LEFT JOIN categories c ON pi.category_id = c.id
      LEFT JOIN products pr ON pi.product_id = pr.id
      LEFT JOIN godowns g ON pi.godown_id = g.id
      WHERE pi.purchase_id = ?
      ORDER BY pi.id`,
      [id]
    );

    const purchase = {
      ...purchases[0],
      items,
    };

    res.json({ success: true, data: purchase });
  } catch (err) {
    next(err);
  }
});

// POST /api/purchase/paddy - Create new paddy purchase
router.post("/", authenticateToken, async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const {
      date,
      invoiceNo,
      challanNo,
      partyId,
      transportInfo,
      notes,
      items,
      discount,
      previousBalance,
      paidAmount,
      paymentMode,
      referenceNo,
    } = req.body;

    // Validation
    if (!date || !invoiceNo || !partyId) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: "Date, invoice number, and party are required",
      });
    }

    if (!items || !Array.isArray(items) || items.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: "At least one item is required",
      });
    }

    // Check for duplicate invoice number
    const [existing] = await connection.query(
      "SELECT id FROM purchases WHERE invoice_no = ?",
      [invoiceNo]
    );

    if (existing.length > 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: "Invoice number already exists",
      });
    }

    // Calculate totals
    const totalQuantity = items.reduce(
      (sum, item) => sum + (item.quantity || 0),
      0
    );
    const totalNetWeight = items.reduce(
      (sum, item) => sum + (item.netWeight || 0),
      0
    );
    const invoiceAmount = items.reduce(
      (sum, item) => sum + (item.totalPrice || 0),
      0
    );
    const totalAmount = invoiceAmount - (discount || 0);
    const netPayable = totalAmount + (previousBalance || 0);
    const currentBalance = netPayable - (paidAmount || 0);

    // Insert purchase header
    const [result] = await connection.query(
      `INSERT INTO purchases (
        date, invoice_no, challan_no, party_id, transport_info, notes,
        total_quantity, total_net_weight, invoice_amount, discount, total_amount,
        previous_balance, net_payable, paid_amount, current_balance,
        payment_mode, reference_no, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed')`,
      [
        date,
        invoiceNo,
        challanNo || null,
        partyId,
        transportInfo || null,
        notes || null,
        totalQuantity,
        totalNetWeight,
        invoiceAmount,
        discount || 0,
        totalAmount,
        previousBalance || 0,
        netPayable,
        paidAmount || 0,
        currentBalance,
        paymentMode || "cash",
        referenceNo || null,
      ]
    );

    const purchaseId = result.insertId;

    // Insert purchase items
    for (const item of items) {
      await connection.query(
        `INSERT INTO purchase_items (
          purchase_id, category_id, product_id, godown_id,
          quantity, net_weight, rate, total_price
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          purchaseId,
          item.categoryId || null,
          item.productId,
          item.godownId || null,
          item.quantity || 0,
          item.netWeight || 0,
          item.rate || 0,
          item.totalPrice || 0,
        ]
      );

      // Update stock movements
      await connection.query(
        `INSERT INTO stock_movements (
          date, product_id, godown_id, movement_type,
          reference_type, reference_id, quantity_in, rate, remarks
        ) VALUES (?, ?, ?, 'purchase', 'purchase', ?, ?, ?, ?)`,
        [
          date,
          item.productId,
          item.godownId || null,
          purchaseId,
          item.quantity || 0,
          item.rate || 0,
          `Paddy Purchase ${invoiceNo}`,
        ]
      );
    }

    // Update party balance
    await connection.query(
      `UPDATE parties 
       SET balance = balance - ?
       WHERE id = ?`,
      [currentBalance, partyId]
    );

    await connection.commit();

    // Fetch created purchase
    const [newPurchase] = await connection.query(
      `SELECT 
        p.id,
        p.date,
        p.invoice_no as invoiceNo,
        p.party_id as partyId,
        pt.name as partyName,
        p.total_quantity as totalQuantity,
        p.total_net_weight as totalNetWeight,
        p.total_amount as totalAmount,
        p.paid_amount as paidAmount,
        p.current_balance as currentBalance,
        p.status
  FROM purchases p
      LEFT JOIN parties pt ON p.party_id = pt.id
      WHERE p.id = ?`,
      [purchaseId]
    );

    res.status(201).json({
      success: true,
      data: newPurchase[0],
      message: "Paddy purchase created successfully",
    });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
});

// PUT /api/purchase/paddy/:id - Update paddy purchase
router.put("/:id", authenticateToken, async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const {
      date,
      challanNo,
      transportInfo,
      notes,
      discount,
      paidAmount,
      paymentMode,
      referenceNo,
      status,
    } = req.body;

    // Check if purchase exists
    const [existing] = await connection.query(
      "SELECT id, invoice_amount, previous_balance FROM purchases WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: "Purchase not found",
      });
    }

    const purchase = existing[0];
    const totalAmount = purchase.invoice_amount - (discount || 0);
    const netPayable = totalAmount + (purchase.previous_balance || 0);
    const currentBalance = netPayable - (paidAmount || 0);

    // Update purchase
    await connection.query(
      `UPDATE purchases 
     SET date = ?, challan_no = ?, transport_info = ?, notes = ?, discount = ?,
       total_amount = ?, net_payable = ?, paid_amount = ?,
       current_balance = ?, payment_mode = ?, reference_no = ?, status = ?
     WHERE id = ?`,
      [
        date,
        challanNo || null,
        transportInfo || null,
        notes || null,
        discount || 0,
        totalAmount,
        netPayable,
        paidAmount || 0,
        currentBalance,
        paymentMode || "cash",
        referenceNo || null,
        status || "completed",
        id,
      ]
    );

    await connection.commit();

    // Fetch updated purchase
    const [updated] = await connection.query(
      `SELECT 
        p.id,
        p.date,
        p.invoice_no as invoiceNo,
        p.total_amount as totalAmount,
        p.paid_amount as paidAmount,
        p.current_balance as currentBalance,
        p.status
  FROM purchases p
      WHERE p.id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: updated[0],
      message: "Paddy purchase updated successfully",
    });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
});

// DELETE /api/purchase/paddy - Delete multiple paddy purchases
router.delete("/", authenticateToken, async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      await connection.rollback();
      return res.status(400).json({
        success: false,
        error: "Purchase IDs are required",
      });
    }

    // Check if purchases exist
    const placeholders = ids.map(() => "?").join(",");
    const [existing] = await connection.query(
      `SELECT id FROM purchases WHERE id IN (${placeholders})`,
      ids
    );

    if (existing.length !== ids.length) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: "Some purchases not found",
      });
    }

    // Soft delete - mark as cancelled
    await connection.query(
      `UPDATE purchases SET status = 'cancelled' WHERE id IN (${placeholders})`,
      ids
    );

    await connection.commit();

    res.json({
      success: true,
      data: { deletedCount: ids.length },
      message: `${ids.length} paddy purchase(s) cancelled successfully`,
    });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
});

// DELETE /api/purchase/paddy/:id - Delete single paddy purchase
router.delete("/:id", authenticateToken, async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { id } = req.params;

    // Check if purchase exists
    const [existing] = await connection.query(
      "SELECT id FROM purchases WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: "Purchase not found",
      });
    }

    // Soft delete - mark as cancelled
    await connection.query(
      "UPDATE purchases SET status = 'cancelled' WHERE id = ?",
      [id]
    );

    await connection.commit();

    res.json({
      success: true,
      data: { deletedCount: 1 },
      message: "Paddy purchase cancelled successfully",
    });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
});

// GET /api/purchase/paddy/statistics/summary - Get paddy purchase summary
router.get("/statistics/summary", authenticateToken, async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;

    let dateCondition = "status != 'cancelled'";
    const params = [];

    if (fromDate && toDate) {
      dateCondition += " AND date BETWEEN ? AND ?";
      params.push(fromDate, toDate);
    }

    const [summary] = await pool.query(
      `SELECT 
        COUNT(*) as totalPurchases,
        COALESCE(SUM(total_quantity), 0) as totalQuantity,
        COALESCE(SUM(total_amount), 0) as totalAmount,
        COALESCE(SUM(current_balance), 0) as totalBalance
  FROM purchases
      WHERE ${dateCondition}`,
      params
    );

    res.json({ success: true, data: summary[0] });
  } catch (err) {
    next(err);
  }
});

export default router;
