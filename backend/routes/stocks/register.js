import { Router } from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = Router();

// GET /api/stocks/register
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const { product_id, category_id, from_date, to_date } = req.query;
    let sql = `
      SELECT
        sr.id,
        sr.date,
        sr.transaction_type AS transactionType,
        sr.reference_no AS referenceNo,
        sr.product_id AS productId,
        p.name AS productName,
        sr.category_id AS categoryId,
        c.name AS categoryName,
        sr.in_quantity AS inQuantity,
        sr.out_quantity AS outQuantity,
        sr.balance_quantity AS balanceQuantity,
        sr.in_weight AS inWeight,
        sr.out_weight AS outWeight,
        sr.balance_weight AS balanceWeight,
        sr.rate,
        sr.remarks
      FROM stock_register sr
      LEFT JOIN products p ON sr.product_id = p.id
      LEFT JOIN categories c ON sr.category_id = c.id
      WHERE 1=1
    `;
    const params = [];
    if (product_id) {
      sql += " AND sr.product_id = ?";
      params.push(product_id);
    }
    if (category_id) {
      sql += " AND sr.category_id = ?";
      params.push(category_id);
    }
    if (from_date) {
      sql += " AND sr.date >= ?";
      params.push(from_date);
    }
    if (to_date) {
      sql += " AND sr.date <= ?";
      params.push(to_date);
    }
    sql += " ORDER BY sr.date ASC, sr.id ASC";
    const [rows] = await pool.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
});

export default router;
