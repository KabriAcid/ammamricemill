import { Router } from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = Router();

// Helper function to generate voucher number
async function generateVoucherNumber(type, year) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();

    const [sequence] = await connection.query(
      `INSERT INTO voucher_sequences (type, year, last_number) 
       VALUES (?, ?, 1) 
       ON DUPLICATE KEY UPDATE last_number = last_number + 1`,
      [type, year]
    );

    const [result] = await connection.query(
      `SELECT last_number FROM voucher_sequences WHERE type = ? AND year = ?`,
      [type, year]
    );

    await connection.commit();

    const number = result[0].last_number;
    const prefix = type.toUpperCase().substring(0, 3);
    return `${prefix}-${year}-${String(number).padStart(4, "0")}`;
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
  }
}

// GET /api/accounts/transactions - Fetch all transactions with filters
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const { fromDate, toDate, voucherType, partyId, headType, headId, status } =
      req.query;

    let conditions = [];
    const params = [];

    if (fromDate && toDate) {
      conditions.push("t.date BETWEEN ? AND ?");
      params.push(fromDate, toDate);
    } else if (fromDate) {
      conditions.push("t.date >= ?");
      params.push(fromDate);
    } else if (toDate) {
      conditions.push("t.date <= ?");
      params.push(toDate);
    }

    if (voucherType) {
      conditions.push("t.type = ?");
      params.push(voucherType);
    }

    if (partyId) {
      conditions.push("t.party_id = ?");
      params.push(partyId);
    }

    if (headType) {
      conditions.push("(t.from_head_type = ? OR t.to_head_type = ?)");
      params.push(headType, headType);
    }

    if (headId) {
      conditions.push("(t.from_head_id = ? OR t.to_head_id = ?)");
      params.push(headId, headId);
    }

    if (status) {
      conditions.push("t.status = ?");
      params.push(status);
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const [transactions] = await pool.query(
      `SELECT 
        t.id,
        t.voucher_number as voucherNumber,
        t.date,
        t.type as voucherType,
        t.amount,
        t.description,
        t.status,
        COALESCE(p.name, 'N/A') as partyName,
        t.party_id as partyId,
        CONCAT(t.from_head_type, ' - ', COALESCE(
          CASE t.from_head_type
            WHEN 'income' THEN (SELECT name FROM income_heads WHERE id = t.from_head_id)
            WHEN 'expense' THEN (SELECT name FROM expense_heads WHERE id = t.from_head_id)
            WHEN 'bank' THEN (SELECT name FROM bank_heads WHERE id = t.from_head_id)
            WHEN 'others' THEN (SELECT name FROM other_heads WHERE id = t.from_head_id)
          END, 'Unknown'
        )) as fromHead,
        t.from_head_id as fromHeadId,
        t.from_head_type as fromHeadType,
        CASE WHEN t.to_head_id IS NOT NULL THEN
          CONCAT(t.to_head_type, ' - ', COALESCE(
            CASE t.to_head_type
              WHEN 'income' THEN (SELECT name FROM income_heads WHERE id = t.to_head_id)
              WHEN 'expense' THEN (SELECT name FROM expense_heads WHERE id = t.to_head_id)
              WHEN 'bank' THEN (SELECT name FROM bank_heads WHERE id = t.to_head_id)
              WHEN 'others' THEN (SELECT name FROM other_heads WHERE id = t.to_head_id)
            END, 'Unknown'
          ))
        ELSE NULL END as toHead,
        t.to_head_id as toHeadId,
        t.to_head_type as toHeadType,
        u.name as createdBy,
        t.created_at as createdAt,
        t.updated_at as updatedAt
      FROM transactions t
      LEFT JOIN parties p ON t.party_id = p.id
      LEFT JOIN users u ON t.created_by = u.id
      ${whereClause}
      ORDER BY t.date DESC, t.created_at DESC`,
      params
    );

    // Calculate summary statistics
    const [stats] = await pool.query(
      `SELECT 
        COUNT(*) as totalTransactions,
        SUM(CASE WHEN type = 'receive' THEN amount ELSE 0 END) as totalReceive,
        SUM(CASE WHEN type = 'payment' THEN amount ELSE 0 END) as totalPayment,
        SUM(amount) as totalAmount,
        COUNT(CASE WHEN status = 'active' THEN 1 END) as activeCount,
        COUNT(CASE WHEN status = 'inactive' THEN 1 END) as inactiveCount
      FROM transactions t
      ${whereClause}`,
      params
    );

    res.json({
      success: true,
      data: transactions,
      stats: stats[0],
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/accounts/transactions/:id - Get single transaction details
router.get("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const [transactions] = await pool.query(
      `SELECT 
        t.*,
        COALESCE(p.name, 'N/A') as partyName,
        p.phone as partyPhone,
        p.address as partyAddress,
        CASE t.from_head_type
          WHEN 'income' THEN (SELECT name FROM income_heads WHERE id = t.from_head_id)
          WHEN 'expense' THEN (SELECT name FROM expense_heads WHERE id = t.from_head_id)
          WHEN 'bank' THEN (SELECT name FROM bank_heads WHERE id = t.from_head_id)
          WHEN 'others' THEN (SELECT name FROM other_heads WHERE id = t.from_head_id)
        END as fromHeadName,
        CASE t.to_head_type
          WHEN 'income' THEN (SELECT name FROM income_heads WHERE id = t.to_head_id)
          WHEN 'expense' THEN (SELECT name FROM expense_heads WHERE id = t.to_head_id)
          WHEN 'bank' THEN (SELECT name FROM bank_heads WHERE id = t.to_head_id)
          WHEN 'others' THEN (SELECT name FROM other_heads WHERE id = t.to_head_id)
        END as toHeadName,
        u.name as createdByName,
        u.email as createdByEmail
      FROM transactions t
      LEFT JOIN parties p ON t.party_id = p.id
      LEFT JOIN users u ON t.created_by = u.id
      WHERE t.id = ?`,
      [id]
    );

    if (!transactions.length) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.json({
      success: true,
      data: transactions[0],
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
      voucherType,
      partyId,
      fromHeadId,
      fromHeadType,
      toHeadId,
      toHeadType,
      description,
      amount,
    } = req.body;

    if (!date || !voucherType || !amount || !fromHeadId || !fromHeadType) {
      return res.status(400).json({
        success: false,
        message:
          "Date, voucher type, amount, fromHeadId, and fromHeadType are required",
      });
    }

    // Generate voucher number
    const year = new Date(date).getFullYear();
    const voucherNumber = await generateVoucherNumber(voucherType, year);

    // Validate voucher type
    const validVoucherTypes = [
      "receive",
      "payment",
      "sales_voucher",
      "purchase_voucher",
      "journal",
      "contra",
    ];
    if (!validVoucherTypes.includes(voucherType)) {
      return res.status(400).json({
        success: false,
        message: "Invalid voucher type",
      });
    }

    // Validate from head exists
    const headTableMap = {
      income: "income_heads",
      expense: "expense_heads",
      bank: "bank_heads",
      others: "other_heads",
    };

    const [fromHeadExists] = await pool.query(
      `SELECT id FROM ${headTableMap[fromHeadType]} WHERE id = ? AND status = 'active'`,
      [fromHeadId]
    );

    if (!fromHeadExists.length) {
      return res.status(400).json({
        success: false,
        message: `Invalid ${fromHeadType} head ID or head is inactive`,
      });
    }

    // Validate to head if provided
    if (toHeadId && toHeadType) {
      const [toHeadExists] = await pool.query(
        `SELECT id FROM ${headTableMap[toHeadType]} WHERE id = ? AND status = 'active'`,
        [toHeadId]
      );

      if (!toHeadExists.length) {
        return res.status(400).json({
          success: false,
          message: `Invalid ${toHeadType} head ID or head is inactive`,
        });
      }
    }

    // Insert the transaction
    const [result] = await pool.query(
      `INSERT INTO transactions (
        voucher_number, date, type, party_id,
        from_head_id, from_head_type, to_head_id, to_head_type,
        amount, description, status, created_by
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active', ?)`,
      [
        voucherNumber,
        date,
        voucherType,
        partyId || null,
        fromHeadId,
        fromHeadType,
        toHeadId || null,
        toHeadType || null,
        amount,
        description || null,
        req.user.id,
      ]
    );

    // Fetch the newly created transaction
    const [newTransaction] = await pool.query(
      `SELECT 
        t.id,
        t.voucher_number as voucherNumber,
        t.date,
        t.type as voucherType,
        t.amount,
        t.description,
        t.status,
        COALESCE(p.name, 'N/A') as partyName,
        t.party_id as partyId
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
    next(err);
  }
});

// PUT /api/accounts/transactions/:id - Update transaction
router.put("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, description, amount, partyId } = req.body;

    if (!date || !amount) {
      return res.status(400).json({
        success: false,
        message: "Date and amount are required",
      });
    }

    // Check if transaction exists
    const [existing] = await pool.query(
      "SELECT id FROM transactions WHERE id = ?",
      [id]
    );

    if (!existing.length) {
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    await pool.query(
      `UPDATE transactions 
       SET date = ?, description = ?, amount = ?, party_id = ?, updated_at = NOW() 
       WHERE id = ?`,
      [date, description || null, amount, partyId || null, id]
    );

    const [updated] = await pool.query(
      `SELECT 
        t.id,
        t.voucher_number as voucherNumber,
        t.date,
        t.type as voucherType,
        t.amount,
        t.description,
        COALESCE(p.name, 'N/A') as partyName
      FROM transactions t
      LEFT JOIN parties p ON t.party_id = p.id
      WHERE t.id = ?`,
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
