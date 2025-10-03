import { Router } from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = Router();

// GET /api/hr/monthly-attendance - Get monthly attendance summaries
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const { year, month } = req.query;
    let query = `
      SELECT 
        DATE_FORMAT(date, '%Y-%m-01') as date,
        COUNT(DISTINCT employee_id) as totalEmployee,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as totalPresent,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as totalAbsent,
        SUM(CASE WHEN status = 'leave' THEN 1 ELSE 0 END) as totalLeave,
        MAX(notes) as description
      FROM attendance_records
      WHERE status != 'inactive'
    `;

    const params = [];
    if (year) {
      query += ` AND YEAR(date) = ?`;
      params.push(year);
    }
    if (month) {
      query += ` AND MONTH(date) = ?`;
      params.push(month);
    }

    query += ` GROUP BY DATE_FORMAT(date, '%Y-%m-01')
              ORDER BY date DESC`;

    const [monthlyAttendance] = await pool.query(query, params);

    res.json({
      success: true,
      data: monthlyAttendance,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/hr/monthly-attendance/:year/:month - Get detailed attendance for a specific month
router.get("/:year/:month", authenticateToken, async (req, res, next) => {
  try {
    const { year, month } = req.params;

    const query = `
      SELECT 
        ar.date,
        e.id as employeeId,
        e.name as employeeName,
        e.designation,
        ar.status,
        ar.in_time as inTime,
        ar.out_time as outTime,
        ar.notes
      FROM attendance_records ar
      JOIN employees e ON ar.employee_id = e.id
      WHERE YEAR(ar.date) = ? 
      AND MONTH(ar.date) = ?
      AND ar.status != 'inactive'
      ORDER BY ar.date ASC, e.name ASC
    `;

    const [monthlyDetails] = await pool.query(query, [year, month]);

    res.json({
      success: true,
      data: monthlyDetails,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/hr/monthly-attendance/trend - Get attendance trend data
router.get("/trend", authenticateToken, async (req, res, next) => {
  try {
    const { year } = req.query;

    const query = `
      SELECT 
        DATE_FORMAT(date, '%Y-%m') as month,
        COUNT(DISTINCT employee_id) as totalEmployee,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as totalPresent,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as totalAbsent,
        SUM(CASE WHEN status = 'leave' THEN 1 ELSE 0 END) as totalLeave,
        ROUND(
          (SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) * 100.0) / 
          COUNT(*),
          2
        ) as attendanceRate
      FROM attendance_records
      WHERE YEAR(date) = ? AND status != 'inactive'
      GROUP BY DATE_FORMAT(date, '%Y-%m')
      ORDER BY month ASC
    `;

    const [trendData] = await pool.query(query, [
      year || new Date().getFullYear(),
    ]);

    res.json({
      success: true,
      data: trendData,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
