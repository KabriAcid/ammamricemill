import { Router } from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = Router();

// GET /api/accounts/transactions - Fetch all transactions
// Optional: Support date range filter for large datasets
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;

    let dateCondition = "";
    const params = [];

    if (fromDate && toDate) {
      dateCondition = "WHERE date BETWEEN ? AND ?";
      params.push(fromDate, toDate);
    } else if (fromDate) {
      dateCondition = "WHERE date >= ?";
      params.push(fromDate);
    } else if (toDate) {
      dateCondition = "WHERE date <= ?";
      params.push(toDate);
    }

    const [transactions] = await pool.query(
      `SELECT 
        t.id,
        t.date,
        COALESCE(p.name, 'N/A') as party,
        t.type as voucherType,
        t.head_type as fromHead,
        '' as toHead,
        t.description,
        t.amount,
        'completed' as status,
        t.created_at as createdAt
      FROM transactions t
      LEFT JOIN parties p ON t.party_id = p.id
      ${dateCondition}
      ORDER BY t.date DESC, t.created_at DESC`,
      params
    );

    res.json({
      success: true,
      data: transactions,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/accounts/transactions - Create new transaction
router.post("/", authenticateToken, async (req, res, next) => {
  try {
    const {
      date,
      party,
      voucherType,
      fromHeadId,
      fromHeadType,
      toHeadId,
      toHeadType,
      description,
      amount,
      status = "pending",
    } = req.body;

    if (!date || !voucherType || !amount || !fromHeadId || !fromHeadType || !toHeadId || !toHeadType) {
      return res.status(400).json({
        success: false,
        error: "Date, voucher type, amount, fromHeadId, fromHeadType, toHeadId, and toHeadType are required",
      });
    }

    // Start transaction
    let connection;
    connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();

      // Get or verify party ID
      let partyId = null;
      if (party) {
        const [existingParty] = await connection.query(
          'SELECT id FROM parties WHERE name = ?',
          [party]
        );
        partyId = existingParty.length > 0 ? existingParty[0].id : null;
      }

      // Validate head references
      const [fromHeadExists] = await connection.query(
        `SELECT id FROM ${fromHeadType}_heads WHERE id = ? AND status = 'active'`,
        [fromHeadId]
      );

      const [toHeadExists] = await connection.query(
        `SELECT id FROM ${toHeadType}_heads WHERE id = ? AND status = 'active'`,
        [toHeadId]
      );

      if (!fromHeadExists.length || !toHeadExists.length) {
        throw new Error('Invalid head references');
      }

      // Insert the transaction
      const [result] = await connection.query(
        `INSERT INTO transactions (
          date, type, party_id, 
          from_head_id, from_head_type,
          to_head_id, to_head_type,
          amount, description, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          date, voucherType, partyId,
          fromHeadId, fromHeadType,
          toHeadId, toHeadType,
          amount, description, status
        ]
      );

      await connection.commit();

      const [newTransaction] = await pool.query(
        `SELECT 
          t.id, t.date, 
          COALESCE(p.name, 'N/A') as party,
          t.type as voucherType,
          t.from_head_type as fromHead,
          t.to_head_type as toHead,
          t.description, t.amount, t.status,
          t.created_at as createdAt
        FROM transactions t
        LEFT JOIN parties p ON t.party_id = p.id
        WHERE t.id = ?`,
        [result.insertId]
      );

      res.status(201).json({
        success: true,
        data: newTransaction[0],
        message: "Transaction created successfully",
      });
    } catch (err) {
      if (connection) await connection.rollback();
      next(err);
    } finally {
      if (connection) connection.release();
    }
  } catch (err) {
    next(err);
  }
});


// PUT /api/accounts/transactions/:id - Update transaction
router.put("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, description, amount } = req.body;

    await pool.query(
      `UPDATE transactions SET date = ?, description = ?, amount = ? WHERE id = ?`,
      [date, description, amount, id]
    );

    const [updated] = await pool.query(
      `SELECT id, date, description, amount FROM transactions WHERE id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: updated[0],
      message: "Transaction updated successfully",
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/accounts/transactions - Bulk delete transactions
router.delete("/", authenticateToken, async (req, res, next) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Please provide an array of transaction IDs to delete",
      });
    }

    const [result] = await pool.query(
      `DELETE FROM transactions WHERE id IN (?)`,
      [ids]
    );

    res.json({
      success: true,
      data: { deletedCount: result.affectedRows },
      message: `${result.affectedRows} transaction(s) deleted successfully`,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
