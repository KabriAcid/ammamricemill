import { Router } from "express";
import { pool } from "../utils/db.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = Router();

// GET /api/dashboard/stats
router.get("/stats", authenticateToken, async (req, res, next) => {
  try {
    console.log("Authenticated user:", req.user);
    console.log("Fetching dashboard stats...");
    // Get total revenue from sales
    const [[{ revenue }]] = await pool.query(
      "SELECT COALESCE(SUM(total_amount),0) AS revenue FROM sales WHERE status = 'delivered'"
    );

    // Get active employees count
    const [[{ employees }]] = await pool.query(
      "SELECT COUNT(*) AS employees FROM employees WHERE status = 'active'"
    );

    // Get current stock value across all godowns
    const [[{ stock }]] = await pool.query(
      `SELECT COALESCE(SUM(sm.balance * p.price),0) AS stock 
       FROM stock_movements sm 
       JOIN products p ON sm.product_id = p.id 
       WHERE sm.id IN (
         SELECT MAX(id) 
         FROM stock_movements 
         GROUP BY product_id
       )`
    );

    // Get active productions count
    const [[{ activeProductions }]] = await pool.query(
      "SELECT COUNT(*) AS activeProductions FROM productions WHERE status = 'in-progress'"
    );

    // Get monthly sales
    const [[{ monthlySales }]] = await pool.query(
      `SELECT COALESCE(SUM(total_amount),0) AS monthlySales 
       FROM sales 
       WHERE status = 'delivered' 
       AND MONTH(date) = MONTH(CURRENT_DATE()) 
       AND YEAR(date) = YEAR(CURRENT_DATE())`
    );

    // Get monthly sales comparison
    const [[{ lastMonthSales }]] = await pool.query(
      `SELECT COALESCE(SUM(total_amount),0) AS lastMonthSales 
       FROM sales 
       WHERE status = 'delivered' 
       AND MONTH(date) = MONTH(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))
       AND YEAR(date) = YEAR(DATE_SUB(CURRENT_DATE(), INTERVAL 1 MONTH))`
    );

    // Calculate monthly growth
    const monthlyGrowth = lastMonthSales
      ? (((monthlySales - lastMonthSales) / lastMonthSales) * 100).toFixed(1)
      : "0.0";

    // Get low stock products (below 10% of capacity)
    const [[{ lowStock }]] = await pool.query(
      `SELECT COUNT(*) AS lowStock 
       FROM stock_movements sm
       JOIN products p ON sm.product_id = p.id
       WHERE sm.balance < (p.price * 0.1)
       AND sm.id IN (
         SELECT MAX(id) 
         FROM stock_movements 
         GROUP BY product_id
       )`
    );

    // Format the stats data
    const statsData = [
      {
        title: "Total Revenue",
        value: `₦${Number(revenue).toLocaleString()}`,
        change: `${monthlyGrowth}%`,
        changeType: Number(monthlyGrowth) >= 0 ? "positive" : "negative",
        icon: "revenue",
        color: "text-green-600",
      },
      {
        title: "Active Employees",
        value: employees,
        change: "Active",
        changeType: "positive",
        icon: "employees",
        color: "text-blue-600",
      },
      {
        title: "Stock Value",
        value: `₦${Number(stock).toLocaleString()}`,
        change: lowStock > 0 ? `${lowStock} low stock` : "Healthy",
        changeType: lowStock > 0 ? "negative" : "positive",
        icon: "stock",
        color: "text-orange-600",
      },
      {
        title: "Active Productions",
        value: activeProductions,
        change: "In Progress",
        changeType: "positive",
        icon: "productions",
        color: "text-purple-600",
      },
      {
        title: "Monthly Sales",
        value: `₦${Number(monthlySales).toLocaleString()}`,
        change: `${monthlyGrowth}%`,
        changeType: Number(monthlyGrowth) >= 0 ? "positive" : "negative",
        icon: "sales",
        color: "text-indigo-600",
      },
    ];

    res.json({
      success: true,
      data: statsData,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/dashboard/activities
router.get("/activities", authenticateToken, async (req, res, next) => {
  try {
    // Get recent activities across different tables
    const [activities] = await pool.query(
      `(SELECT 
          'sale' as type,
          CONCAT('New sale of ₦', total_amount, ' to ', 
                 COALESCE((SELECT name FROM parties WHERE id = sales.party_id), 'Unknown')) as action,
          date as date
        FROM sales
        WHERE status = 'delivered'
        ORDER BY date DESC
        LIMIT 5)
      UNION ALL
      (SELECT 
          'purchase' as type,
          CONCAT('New purchase of ₦', total_amount, ' from ',
                 COALESCE((SELECT name FROM parties WHERE id = purchases.party_id), 'Unknown')) as action,
          date as date
        FROM purchases
        WHERE status = 'completed'
        ORDER BY date DESC
        LIMIT 5)
      UNION ALL
      (SELECT 
          'production' as type,
          CONCAT('Production completed with ', total_quantity, ' units') as action,
          date as date
        FROM productions
        WHERE status = 'completed'
        ORDER BY date DESC
        LIMIT 5)
      ORDER BY date DESC
      LIMIT 10`
    );

    // Format the activities data
    const formattedActivities = activities.map((activity, index) => ({
      id: index + 1,
      action: activity.action,
      time: new Date(activity.date).toLocaleDateString("en-US", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
      type: activity.type,
    }));

    res.json({
      success: true,
      data: formattedActivities,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
