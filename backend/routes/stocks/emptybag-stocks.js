import express from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = express.Router();

// GET /api/stocks/emptybag-stocks
// Returns aggregated stock numbers per emptybag product
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    // Aggregation: use add_stocks and stock_movements which have product_id.
    // The emptybag_* tables (purchases/payments/sales) do not store product_id in this schema,
    // so querying them by product would fail. We aggregate from add_stocks and stock_movements
    // which reliably reference products.
    const [rows] = await pool.query(
      `SELECT p.id AS productId,
              p.name AS productName,
              c.id AS categoryId,
              c.name AS categoryName,
              p.size,
              p.weight,
              COALESCE(a.added_qty,0) AS opening,
              COALESCE(m.in_qty,0) AS receive,
              COALESCE(a.added_qty,0) AS purchase,
              COALESCE(m.out_qty,0) AS payment,
              COALESCE(m.out_qty,0) AS sales,
              (COALESCE(a.added_qty,0) + COALESCE(m.in_qty,0) - COALESCE(m.out_qty,0)) AS stocks
       FROM emptybag_products p
       LEFT JOIN emptybag_categories c ON p.category_id = c.id
       LEFT JOIN (
         -- additions recorded via add_stocks
         SELECT product_id, SUM(quantity) AS added_qty FROM add_stocks GROUP BY product_id
       ) a ON a.product_id = p.id
       LEFT JOIN (
         -- general stock movements (in/out)
         SELECT product_id, COALESCE(SUM(quantity_in),0) AS in_qty, COALESCE(SUM(quantity_out),0) AS out_qty FROM stock_movements GROUP BY product_id
       ) m ON m.product_id = p.id
       ORDER BY p.name ASC`
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
});

export default router;
