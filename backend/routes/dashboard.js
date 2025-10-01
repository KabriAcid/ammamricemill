import { Router } from "express";
import { pool } from "../utils/db.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = Router();

// GET /api/dashboard/stats
router.get("/stats", authenticateToken, async (req, res, next) => {
  try {
    const [[{ revenue }]] = await pool.query(
      "SELECT COALESCE(SUM(amount),0) AS revenue FROM sales"
    );
    const [[{ employees }]] = await pool.query(
      "SELECT COUNT(*) AS employees FROM employees"
    );
    const [[{ stock }]] = await pool.query(
      "SELECT COALESCE(SUM(stock),0) AS stock FROM products"
    );
    const [[{ activeProductions }]] = await pool.query(
      "SELECT COUNT(*) AS activeProductions FROM productions WHERE status='active'"
    );
    const [[{ monthlySales }]] = await pool.query(
      "SELECT COALESCE(SUM(amount),0) AS monthlySales FROM sales WHERE MONTH(created_at) = MONTH(CURRENT_DATE())"
    );

    res.json({
      success: true,
      data: { revenue, employees, stock, activeProductions, monthlySales },
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/activities
router.get("/activities", authenticateToken, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM activities ORDER BY created_at DESC LIMIT 10"
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
});

export default router;
