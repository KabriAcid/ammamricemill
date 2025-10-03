import { Router } from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = Router();

// GET /api/hr/salary - Fetch all salary records with pagination and filters
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const {
      page = 1,
      pageSize = 25,
      search = "",
      year = "",
      month = "",
    } = req.query;

    // Build base query
    let query = `
      SELECT 
        s.id,
        s.date,
        s.year,
        s.month,
        s.description,
        s.total_employees as totalEmployees,
        s.total_salary as totalSalary,
        s.created_at as createdAt,
        s.updated_at as updatedAt
      FROM monthly_salary s
      WHERE 1=1
    `;

    const params = [];

    // Add filters
    if (search) {
      query += " AND (s.description LIKE ? OR s.month LIKE ?)";
      params.push(`%${search}%`, `%${search}%`);
    }

    if (year) {
      query += " AND s.year = ?";
      params.push(year);
    }

    if (month) {
      query += " AND s.month = ?";
      params.push(month);
    }

    query += " ORDER BY s.date DESC";

    const [salaries] = await pool.query(query, params);

    // Get employee salaries for each record
    for (const salary of salaries) {
      const [employeeSalaries] = await pool.query(
        `
        SELECT 
          es.employee_id as employeeId,
          e.name as employeeName,
          CONCAT('EMP', LPAD(e.id, 3, '0')) as empId,
          d.name as designation,
          es.salary,
          es.bonus_ot as bonusOT,
          es.absent_fine as absentFine,
          es.deduction,
          es.payment,
          es.note,
          es.signature
        FROM employee_salary es
        LEFT JOIN employees e ON es.employee_id = e.id
        LEFT JOIN designations d ON e.designation_id = d.id
        WHERE es.monthly_salary_id = ?
      `,
        [salary.id]
      );

      salary.employeeSalaries = employeeSalaries;
    }

    res.json({
      success: true,
      data: {
        salaries,
        pagination: {
          currentPage: parseInt(page),
          pageSize: parseInt(pageSize),
          totalItems: salaries.length,
        },
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/hr/salary - Create new salary record
router.post("/", authenticateToken, async (req, res, next) => {
  try {
    const { date, year, month, description, employeeSalaries } = req.body;

    const totalEmployees = employeeSalaries.length;
    const totalSalary = employeeSalaries.reduce(
      (sum, emp) => sum + emp.payment,
      0
    );

    const [result] = await pool.query(
      `INSERT INTO monthly_salary (date, year, month, description, total_employees, total_salary)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [date, year, month, description, totalEmployees, totalSalary]
    );

    const monthlyId = result.insertId;

    // Insert employee salaries
    for (const emp of employeeSalaries) {
      await pool.query(
        `INSERT INTO employee_salary (
          monthly_salary_id, employee_id, salary, bonus_ot, 
          absent_fine, deduction, payment, note, signature
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          monthlyId,
          emp.employeeId,
          emp.salary,
          emp.bonusOT,
          emp.absentFine,
          emp.deduction,
          emp.payment,
          emp.note || null,
          emp.signature || null,
        ]
      );
    }

    res.json({
      success: true,
      message: "Salary record created successfully",
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/hr/salary/:id - Update salary record
router.put("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const { date, year, month, description, employeeSalaries } = req.body;

    const totalEmployees = employeeSalaries.length;
    const totalSalary = employeeSalaries.reduce(
      (sum, emp) => sum + emp.payment,
      0
    );

    await pool.query(
      `UPDATE monthly_salary 
       SET date = ?, year = ?, month = ?, description = ?, 
           total_employees = ?, total_salary = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [date, year, month, description, totalEmployees, totalSalary, id]
    );

    // Delete existing employee salaries
    await pool.query(
      "DELETE FROM employee_salary WHERE monthly_salary_id = ?",
      [id]
    );

    // Insert updated employee salaries
    for (const emp of employeeSalaries) {
      await pool.query(
        `INSERT INTO employee_salary (
          monthly_salary_id, employee_id, salary, bonus_ot, 
          absent_fine, deduction, payment, note, signature
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          id,
          emp.employeeId,
          emp.salary,
          emp.bonusOT,
          emp.absentFine,
          emp.deduction,
          emp.payment,
          emp.note || null,
          emp.signature || null,
        ]
      );
    }

    res.json({
      success: true,
      message: "Salary record updated successfully",
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/hr/salary - Delete salary records
router.delete("/", authenticateToken, async (req, res, next) => {
  try {
    const { ids } = req.body;

    // Delete employee salaries first (foreign key constraint)
    await pool.query(
      "DELETE FROM employee_salary WHERE monthly_salary_id IN (?)",
      [ids]
    );

    // Delete monthly salary records
    await pool.query("DELETE FROM monthly_salary WHERE id IN (?)", [ids]);

    res.json({
      success: true,
      message: "Salary records deleted successfully",
    });
  } catch (err) {
    next(err);
  }
});

export default router;
