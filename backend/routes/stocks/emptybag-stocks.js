import express from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = express.Router();

// GET /api/stocks/emptybag-stocks
// Returns aggregated stock numbers per emptybag product
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    // Simple aggregation using available tables. Adjust joins as needed.
    const [rows] = await pool.query(
      `SELECT p.id AS productId,
              p.name AS productName,
              c.id AS categoryId,
              c.name AS categoryName,
              p.size,
              p.weight,
              COALESCE(opening.opening_qty,0) AS opening,
              COALESCE(receive.receive_qty,0) AS receive,
              COALESCE(purchase.purchase_qty,0) AS purchase,
              COALESCE(payment.payment_qty,0) AS payment,
              COALESCE(sales.sales_qty,0) AS sales,
              (COALESCE(opening.opening_qty,0) + COALESCE(receive.receive_qty,0) + COALESCE(purchase.purchase_qty,0) - COALESCE(payment.payment_qty,0) - COALESCE(sales.sales_qty,0)) AS stocks
       FROM emptybag_products p
       LEFT JOIN emptybag_categories c ON p.category_id = c.id
       LEFT JOIN (
         SELECT product_id, SUM(quantity) AS opening_qty FROM add_stocks WHERE 1 GROUP BY product_id
       ) opening ON opening.product_id = p.id
       LEFT JOIN (
         SELECT product_id, SUM(quantity) AS receive_qty FROM emptybag_purchases WHERE 1 GROUP BY product_id
       ) receive ON receive.product_id = p.id
       LEFT JOIN (
         SELECT product_id, SUM(quantity) AS purchase_qty FROM add_stocks WHERE 1 GROUP BY product_id
       ) purchase ON purchase.product_id = p.id
       LEFT JOIN (
         SELECT product_id, SUM(quantity) AS payment_qty FROM emptybag_payments WHERE 1 GROUP BY product_id
       ) payment ON payment.product_id = p.id
       LEFT JOIN (
         SELECT product_id, SUM(quantity) AS sales_qty FROM emptybag_sales WHERE 1 GROUP BY product_id
       ) sales ON sales.product_id = p.id
       ORDER BY p.name ASC`
    );

    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
});

export default router;
