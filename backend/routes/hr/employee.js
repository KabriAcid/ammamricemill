import { Router } from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = Router();

// GET /api/hr/employee - Fetch all employees
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const { status } = req.query;

    // Get all employees with designation name - frontend handles search/filter/pagination
    let query = `
      SELECT 
        e.id,
        e.name,
        e.email,
        e.phone as mobile,
        d.name as designation,
        e.designation_id as designationId,
        e.salary,
        e.joining_date as joiningDate,
        e.status = 'active' as isActive,
        e.created_at as createdAt,
        e.created_at as updatedAt,
        CONCAT('EMP', LPAD(e.id, 3, '0')) as empId
      FROM employees e
      LEFT JOIN designations d ON e.designation_id = d.id`;

    const params = [];
    if (status) {
      query += " WHERE e.status = ?";
      params.push(status);
    }

    query += " ORDER BY e.created_at DESC";

    const [employees] = await pool.query(query, params);

    res.json({
      success: true,
      data: employees,
    });
  } catch (err) {
    next(err);
  }
});

// Other routes remain the same...

export default router;
