import { Router } from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = Router();

// GET /api/hr/salary - Fetch all salary records with pagination and search
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const {
      page = 1,
      pageSize = 25,
      search = "",
      year = "",
      month = "",
    } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limit = parseInt(pageSize);

    // Build search condition
    let searchCondition = "WHERE 1=1";
    const searchParams = [];

    if (year) {
      searchCondition += " AND year = ?";
      searchParams.push(year);
    }

    if (month) {
      searchCondition += " AND month = ?";
      searchParams.push(month);
    }

    if (search) {
      searchCondition += " AND (description LIKE ? OR month LIKE ?)";
      searchParams.push(`%${search}%`, `%${search}%`);
    }

    // Get total count
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(*) as total FROM monthly_salary ${searchCondition}`,
      searchParams
    );

    // Get salary records
    const [salaries] = await pool.query(
      `SELECT 
        id,
        date,
        year,
        month,
        description,
        total_employees as totalEmployees,
        total_salary as totalSalary,
        created_at as createdAt,
        updated_at as updatedAt
      FROM monthly_salary
      ${searchCondition}
      ORDER BY date DESC
      LIMIT ? OFFSET ?`,
      [...searchParams, limit, offset]
    );

    // Get employee salary details for each record
    const salariesWithEmployees = await Promise.all(
      salaries.map(async (salary) => {
        const [employees] = await pool.query(
          `SELECT 
            es.employee_id as employeeId,
            e.emp_id as empId,
            e.name as employeeName,
            e.designation,
            es.salary,
            es.bonus_ot as bonusOT,
            es.absent_fine as absentFine,
            es.deduction,
            es.payment,
            es.note,
            es.signature
          FROM employee_salary es
          LEFT JOIN employees e ON es.employee_id = e.id
          WHERE es.salary_id = ?`,
          [salary.id]
        );

        return {
          ...salary,
          employeeSalaries: employees,
        };
      })
    );

    res.json({
      success: true,
      data: {
        salaries: salariesWithEmployees,
        pagination: {
          total: parseInt(total),
          page: parseInt(page),
          pageSize: parseInt(pageSize),
          totalPages: Math.ceil(total / pageSize),
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
    const {
      date,
      year,
      month,
      description,
      totalEmployees,
      totalSalary,
      employeeSalaries,
    } = req.body;

    // Validation
    if (!date || !year || !month || !employeeSalaries) {
      return res.status(400).json({
        success: false,
        error: "Required fields are missing",
      });
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Insert salary record
      const [result] = await connection.query(
        `INSERT INTO monthly_salary (
          date, year, month, description, 
          total_employees, total_salary
        ) VALUES (?, ?, ?, ?, ?, ?)`,
        [date, year, month, description, totalEmployees, totalSalary]
      );

      const salaryId = result.insertId;

      // Insert employee salary records
      if (employeeSalaries.length > 0) {
        const values = employeeSalaries.map((emp) => [
          salaryId,
          emp.employeeId,
          emp.salary,
          emp.bonusOT || 0,
          emp.absentFine || 0,
          emp.deduction || 0,
          emp.payment,
          emp.note || null,
          emp.signature || null,
        ]);

        await connection.query(
          `INSERT INTO employee_salary (
            salary_id, employee_id, salary, 
            bonus_ot, absent_fine, deduction, 
            payment, note, signature
          ) VALUES ?`,
          [values]
        );
      }

      await connection.commit();

      // Fetch the newly created record
      const [[newSalary]] = await pool.query(
        `SELECT 
          id, date, year, month, description,
          total_employees as totalEmployees,
          total_salary as totalSalary,
          created_at as createdAt,
          updated_at as updatedAt
        FROM monthly_salary
        WHERE id = ?`,
        [salaryId]
      );

      res.status(201).json({
        success: true,
        data: newSalary,
        message: "Salary record created successfully",
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    next(err);
  }
});

// PUT /api/hr/salary/:id - Update salary record
router.put("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      date,
      year,
      month,
      description,
      totalEmployees,
      totalSalary,
      employeeSalaries,
    } = req.body;

    // Validation
    if (!date || !year || !month || !employeeSalaries) {
      return res.status(400).json({
        success: false,
        error: "Required fields are missing",
      });
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Update salary record
      await connection.query(
        `UPDATE monthly_salary 
        SET date = ?, year = ?, month = ?, description = ?,
            total_employees = ?, total_salary = ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?`,
        [date, year, month, description, totalEmployees, totalSalary, id]
      );

      // Delete existing employee salary records
      await connection.query(
        "DELETE FROM employee_salary WHERE salary_id = ?",
        [id]
      );

      // Insert updated employee salary records
      if (employeeSalaries.length > 0) {
        const values = employeeSalaries.map((emp) => [
          id,
          emp.employeeId,
          emp.salary,
          emp.bonusOT || 0,
          emp.absentFine || 0,
          emp.deduction || 0,
          emp.payment,
          emp.note || null,
          emp.signature || null,
        ]);

        await connection.query(
          `INSERT INTO employee_salary (
            salary_id, employee_id, salary, 
            bonus_ot, absent_fine, deduction, 
            payment, note, signature
          ) VALUES ?`,
          [values]
        );
      }

      await connection.commit();

      // Fetch updated record
      const [[updatedSalary]] = await pool.query(
        `SELECT 
          id, date, year, month, description,
          total_employees as totalEmployees,
          total_salary as totalSalary,
          created_at as createdAt,
          updated_at as updatedAt
        FROM monthly_salary
        WHERE id = ?`,
        [id]
      );

      res.json({
        success: true,
        data: updatedSalary,
        message: "Salary record updated successfully",
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    next(err);
  }
});

// DELETE /api/hr/salary - Delete salary record(s)
router.delete("/", authenticateToken, async (req, res, next) => {
  try {
    const { ids } = req.body;

    // Validation
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Please provide an array of IDs to delete",
      });
    }

    // Start transaction
    const connection = await pool.getConnection();
    await connection.beginTransaction();

    try {
      // Delete employee salary records first (foreign key constraint)
      await connection.query(
        "DELETE FROM employee_salary WHERE salary_id IN (?)",
        [ids]
      );

      // Delete salary records
      const [result] = await connection.query(
        "DELETE FROM monthly_salary WHERE id IN (?)",
        [ids]
      );

      await connection.commit();

      res.json({
        success: true,
        data: {
          deletedCount: result.affectedRows,
        },
        message: `${result.affectedRows} salary record(s) deleted successfully`,
      });
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }
  } catch (err) {
    next(err);
  }
});

export default router;
