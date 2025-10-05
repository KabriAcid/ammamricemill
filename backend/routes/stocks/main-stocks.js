import express from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = express.Router();

// GET /api/stocks/main-stocks - List main stock details with joins
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const { category_id, godown_id } = req.query;
    let sql = `
      SELECT
        s.id,
        c.id AS categoryId,
        c.name AS categoryName,
        p.id AS productId,
        p.name AS productName,
        s.opening_stock AS opening,
        s.stock_added AS add,
        s.purchase_stock AS purchase,
        s.sales_stock AS sales,
        s.production_stock AS production,
        s.production_used_stock AS productionStocks,
        s.current_stock AS stock,
        s.avg_price AS avgPrice,
        (s.current_stock * s.avg_price) AS totalPrice
      FROM stocks s
      LEFT JOIN products p ON s.product_id = p.id
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];
    if (category_id) {
      sql += " AND c.id = ?";
      params.push(category_id);
    }
    if (godown_id) {
      sql += " AND s.godown_id = ?";
      params.push(godown_id);
    }
    sql += " ORDER BY c.name, p.name";
    const [rows] = await pool.query(sql, params);
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
});

export default router;
