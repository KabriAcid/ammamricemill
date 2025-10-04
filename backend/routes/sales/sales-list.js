import { Router } from "express";
import { pool } from "../utils/db.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = Router();

// GET /api/sales - Fetch all sales
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;

    let dateCondition = "";
    const params = [];

    if (fromDate && toDate) {
      dateCondition = "AND s.date BETWEEN ? AND ?";
      params.push(fromDate, toDate);
    }

    const [records] = await pool.query(
      `SELECT 
        s.id,
        s.date,
        s.invoice_no as invoiceNo,
        s.party_id as partyId,
        p.name as partyName,
        s.transport_info as transportInfo,
        s.notes,
        s.total_quantity as totalQuantity,
        s.total_net_weight as totalNetWeight,
        s.invoice_amount as invoiceAmount,
        s.discount,
        s.total_amount as totalAmount,
        s.previous_balance as previousBalance,
        s.net_receivable as netReceivable,
        s.received_amount as receivedAmount,
        s.current_balance as currentBalance,
        s.payment_mode as paymentMode,
        s.reference_no as referenceNo,
        s.status,
        s.created_at as createdAt,
        s.updated_at as updatedAt
      FROM sales s
      LEFT JOIN parties p ON s.party_id = p.id
      WHERE s.status != 'cancelled' ${dateCondition}
      ORDER BY s.date DESC, s.created_at DESC`,
      params
    );

    res.json({ success: true, data: records });
  } catch (err) {
    next(err);
  }
});

// GET /api/sales/:id - Fetch single sale with items
router.get("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    // Fetch sale header
    const [sales] = await pool.query(
      `SELECT 
        s.id,
        s.date,
        s.invoice_no as invoiceNo,
        s.party_id as partyId,
        p.name as partyName,
        s.transport_info as transportInfo,
        s.notes,
        s.total_quantity as totalQuantity,
        s.total_net_weight as totalNetWeight,
        s.invoice_amount as invoiceAmount,
        s.discount,
        s.total_amount as totalAmount,
        s.previous_balance as previousBalance,
        s.net_receivable as netReceivable,
        s.received_amount as receivedAmount,
        s.current_balance as currentBalance,
        s.payment_mode as paymentMode,
        s.reference_no as referenceNo,
        s.status,
        s.created_at as createdAt,
        s.updated_at as updatedAt
      FROM sales s
      LEFT JOIN parties p ON s.party_id = p.id
      WHERE s.id = ?`,
      [id]
    );

    if (sales.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Sale not found",
      });
    }

    // Fetch sale items
    const [items] = await pool.query(
      `SELECT 
        si.id,
        si.category_id as categoryId,
        c.name as categoryName,
        si.product_id as productId,
        pr.name as productName,
        si.godown_id as godownId,
        g.name as godownName,
        si.quantity,
        si.net_weight as netWeight,
        si.rate,
        si.total_price as totalPrice,
        si.created_at as createdAt
      FROM sales_items si
      LEFT JOIN categories c ON si.category_id = c.id
      LEFT JOIN products pr ON si.product_id = pr.id
      LEFT JOIN godowns g ON si.godown_id = g.id
      WHERE si.sales_id = ?
      ORDER BY si.id`,
      [id]
    );

    const sale = {
      ...sales[0],
      items,
    };

    res.json({ success: true, data: sale });
  } catch (err) {
    next(err);
  }
});

// POST /api/sales - Create new sale
router.post("/", authenticateToken, async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const {
      date,
      invoiceNo,
      partyId,
      transportInfo,
      notes,
      items,
      discount,
      previousBalance,
      receivedAmount,
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
      "SELECT id FROM sales WHERE invoice_no = ?",
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
    const netReceivable = totalAmount + (previousBalance || 0);
    const currentBalance = netReceivable - (receivedAmount || 0);

    // Insert sale header
    const [result] = await connection.query(
      `INSERT INTO sales (
        date, invoice_no, party_id, transport_info, notes,
        total_quantity, total_net_weight, invoice_amount, discount, total_amount,
        previous_balance, net_receivable, received_amount, current_balance,
        payment_mode, reference_no, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'completed')`,
      [
        date,
        invoiceNo,
        partyId,
        transportInfo || null,
        notes || null,
        totalQuantity,
        totalNetWeight,
        invoiceAmount,
        discount || 0,
        totalAmount,
        previousBalance || 0,
        netReceivable,
        receivedAmount || 0,
        currentBalance,
        paymentMode || "cash",
        referenceNo || null,
      ]
    );

    const salesId = result.insertId;

    // Insert sale items
    for (const item of items) {
      await connection.query(
        `INSERT INTO sales_items (
          sales_id, category_id, product_id, godown_id,
          quantity, net_weight, rate, total_price
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          salesId,
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
          reference_type, reference_id, quantity_out, rate, remarks
        ) VALUES (?, ?, ?, 'sales', 'sales', ?, ?, ?, ?)`,
        [
          date,
          item.productId,
          item.godownId || null,
          salesId,
          item.quantity || 0,
          item.rate || 0,
          `Sale ${invoiceNo}`,
        ]
      );
    }

    // Update party balance
    await connection.query(
      `UPDATE parties 
       SET balance = balance + ?
       WHERE id = ?`,
      [currentBalance, partyId]
    );

    await connection.commit();

    // Fetch created sale
    const [newSale] = await connection.query(
      `SELECT 
        s.id,
        s.date,
        s.invoice_no as invoiceNo,
        s.party_id as partyId,
        p.name as partyName,
        s.total_quantity as totalQuantity,
        s.total_net_weight as totalNetWeight,
        s.total_amount as totalAmount,
        s.received_amount as receivedAmount,
        s.current_balance as currentBalance,
        s.status
      FROM sales s
      LEFT JOIN parties p ON s.party_id = p.id
      WHERE s.id = ?`,
      [salesId]
    );

    res.status(201).json({
      success: true,
      data: newSale[0],
      message: "Sale created successfully",
    });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
});

// PUT /api/sales/:id - Update sale
router.put("/:id", authenticateToken, async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { id } = req.params;
    const {
      date,
      transportInfo,
      notes,
      discount,
      receivedAmount,
      paymentMode,
      referenceNo,
      status,
    } = req.body;

    // Check if sale exists
    const [existing] = await connection.query(
      "SELECT id, invoice_amount, previous_balance FROM sales WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: "Sale not found",
      });
    }

    const sale = existing[0];
    const totalAmount = sale.invoice_amount - (discount || 0);
    const netReceivable = totalAmount + (sale.previous_balance || 0);
    const currentBalance = netReceivable - (receivedAmount || 0);

    // Update sale
    await connection.query(
      `UPDATE sales 
       SET date = ?, transport_info = ?, notes = ?, discount = ?,
           total_amount = ?, net_receivable = ?, received_amount = ?,
           current_balance = ?, payment_mode = ?, reference_no = ?, status = ?
       WHERE id = ?`,
      [
        date,
        transportInfo || null,
        notes || null,
        discount || 0,
        totalAmount,
        netReceivable,
        receivedAmount || 0,
        currentBalance,
        paymentMode || "cash",
        referenceNo || null,
        status || "completed",
        id,
      ]
    );

    await connection.commit();

    // Fetch updated sale
    const [updated] = await connection.query(
      `SELECT 
        s.id,
        s.date,
        s.invoice_no as invoiceNo,
        s.total_amount as totalAmount,
        s.received_amount as receivedAmount,
        s.current_balance as currentBalance,
        s.status
      FROM sales s
      WHERE s.id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: updated[0],
      message: "Sale updated successfully",
    });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
});

// DELETE /api/sales/:id - Delete single sale
router.delete("/:id", authenticateToken, async (req, res, next) => {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const { id } = req.params;

    // Check if sale exists
    const [existing] = await connection.query(
      "SELECT id FROM sales WHERE id = ?",
      [id]
    );

    if (existing.length === 0) {
      await connection.rollback();
      return res.status(404).json({
        success: false,
        error: "Sale not found",
      });
    }

    // Soft delete - mark as cancelled
    await connection.query(
      "UPDATE sales SET status = 'cancelled' WHERE id = ?",
      [id]
    );

    await connection.commit();

    res.json({
      success: true,
      data: { deletedCount: 1 },
      message: "Sale cancelled successfully",
    });
  } catch (err) {
    await connection.rollback();
    next(err);
  } finally {
    connection.release();
  }
});

// GET /api/sales/statistics/summary - Get sales summary
router.get("/statistics/summary", authenticateToken, async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;

    let dateCondition = "";
    const params = [];

    if (fromDate && toDate) {
      dateCondition = "WHERE date BETWEEN ? AND ? AND status != 'cancelled'";
      params.push(fromDate, toDate);
    } else {
      dateCondition = "WHERE status != 'cancelled'";
    }

    const [summary] = await pool.query(
      `SELECT 
        COUNT(*) as totalSales,
        COALESCE(SUM(total_quantity), 0) as totalQuantity,
        COALESCE(SUM(total_amount), 0) as totalAmount,
        COALESCE(SUM(current_balance), 0) as totalBalance
      FROM sales
      ${dateCondition}`,
      params
    );

    res.json({ success: true, data: summary[0] });
  } catch (err) {
    next(err);
  }
});

export default router;
