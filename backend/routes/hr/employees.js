import { Router } from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = Router();

// GET /api/hr/employee - Fetch all employees
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    // Get all employees with designation name - frontend handles search/filter/pagination
    const [employees] = await pool.query(
      `SELECT 
        e.id,
        e.name,
        e.email,
        e.phone as mobile,
        d.name as designation,
        e.designation_id as designationId,
        e.salary,
        'monthly' as salaryType,
        e.joining_date as joiningDate,
        e.salary as grossAmount,
        0 as bonus,
        0 as loan,
        0 as tax,
        e.salary as netSalary,
        0 as absence,
        NULL as bankName,
        NULL as accountName,
        NULL as accountNo,
        NULL as address,
        NULL as nationalId,
        NULL as fatherName,
        NULL as motherName,
        NULL as bloodGroup,
        NULL as others,
        NULL as photoUrl,
        e.status = 'active' as isActive,
        e.created_at as createdAt,
        e.created_at as updatedAt,
        CONCAT('EMP', LPAD(e.id, 3, '0')) as empId
      FROM employees e
      LEFT JOIN designations d ON e.designation_id = d.id
      ORDER BY e.created_at DESC`
    );

    res.json({
      success: true,
      data: employees,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/hr/employee/:id - Fetch single employee by ID
router.get("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;

    const [employees] = await pool.query(
      `SELECT 
        e.id,
        e.name,
        e.email,
        e.phone as mobile,
        d.name as designation,
        e.designation_id as designationId,
        e.salary,
        'monthly' as salaryType,
        e.joining_date as joiningDate,
        e.salary as grossAmount,
        0 as bonus,
        0 as loan,
        0 as tax,
        e.salary as netSalary,
        0 as absence,
        NULL as bankName,
        NULL as accountName,
        NULL as accountNo,
        NULL as address,
        NULL as nationalId,
        NULL as fatherName,
        NULL as motherName,
        NULL as bloodGroup,
        NULL as others,
        NULL as photoUrl,
        e.status = 'active' as isActive,
        e.created_at as createdAt,
        e.created_at as updatedAt,
        CONCAT('EMP', LPAD(e.id, 3, '0')) as empId
      FROM employees e
      LEFT JOIN designations d ON e.designation_id = d.id
      WHERE e.id = ?`,
      [id]
    );

    if (employees.length === 0) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    res.json({
      success: true,
      data: employees[0],
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/hr/employee - Create new employee
router.post("/", authenticateToken, async (req, res, next) => {
  try {
    const {
      name,
      email,
      mobile,
      designation,
      designationId,
      salary,
      joiningDate,
      isActive,
    } = req.body;

    // Validation
    if (!name || !mobile || !salary || !joiningDate) {
      return res.status(400).json({
        success: false,
        error: "Name, mobile, salary, and joining date are required",
      });
    }

    // Check for duplicate email
    if (email) {
      const [[existing]] = await pool.query(
        "SELECT id FROM employees WHERE email = ?",
        [email]
      );

      if (existing) {
        return res.status(400).json({
          success: false,
          error: "Employee with this email already exists",
        });
      }
    }

    // Validate designation ID if provided
    let validDesignationId = designationId;
    if (designation && !designationId) {
      // Try to find designation by name
      const [[des]] = await pool.query(
        "SELECT id FROM designations WHERE name = ? AND status = 'active'",
        [designation]
      );
      validDesignationId = des ? des.id : null;
    }

    // Insert new employee
    const [result] = await pool.query(
      `INSERT INTO employees (name, email, phone, designation_id, salary, joining_date, status) 
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        name,
        email || null,
        mobile,
        validDesignationId || null,
        salary,
        joiningDate,
        isActive ? "active" : "inactive",
      ]
    );

    // Fetch the newly created employee
    const [newEmployee] = await pool.query(
      `SELECT 
        e.id,
        e.name,
        e.email,
        e.phone as mobile,
        d.name as designation,
        e.designation_id as designationId,
        e.salary,
        'monthly' as salaryType,
        e.joining_date as joiningDate,
        e.salary as grossAmount,
        0 as bonus,
        0 as loan,
        0 as tax,
        e.salary as netSalary,
        0 as absence,
        NULL as bankName,
        NULL as accountName,
        NULL as accountNo,
        NULL as address,
        NULL as nationalId,
        NULL as fatherName,
        NULL as motherName,
        NULL as bloodGroup,
        NULL as others,
        NULL as photoUrl,
        e.status = 'active' as isActive,
        e.created_at as createdAt,
        e.created_at as updatedAt,
        CONCAT('EMP', LPAD(e.id, 3, '0')) as empId
      FROM employees e
      LEFT JOIN designations d ON e.designation_id = d.id
      WHERE e.id = ?`,
      [result.insertId]
    );

    res.status(201).json({
      success: true,
      data: newEmployee[0],
      message: "Employee created successfully",
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/hr/employee/:id - Update existing employee
router.put("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      name,
      email,
      mobile,
      designation,
      designationId,
      salary,
      joiningDate,
      isActive,
    } = req.body;

    // Validation
    if (!name || !mobile || !salary || !joiningDate) {
      return res.status(400).json({
        success: false,
        error: "Name, mobile, salary, and joining date are required",
      });
    }

    // Check if employee exists
    const [[existingEmployee]] = await pool.query(
      "SELECT id FROM employees WHERE id = ?",
      [id]
    );

    if (!existingEmployee) {
      return res.status(404).json({
        success: false,
        error: "Employee not found",
      });
    }

    // Check for duplicate email (excluding current employee)
    if (email) {
      const [[duplicate]] = await pool.query(
        "SELECT id FROM employees WHERE email = ? AND id != ?",
        [email, id]
      );

      if (duplicate) {
        return res.status(400).json({
          success: false,
          error: "Another employee with this email already exists",
        });
      }
    }

    // Validate designation ID if provided
    let validDesignationId = designationId;
    if (designation && !designationId) {
      const [[des]] = await pool.query(
        "SELECT id FROM designations WHERE name = ? AND status = 'active'",
        [designation]
      );
      validDesignationId = des ? des.id : null;
    }

    // Update employee
    await pool.query(
      `UPDATE employees 
       SET name = ?, email = ?, phone = ?, designation_id = ?, 
           salary = ?, joining_date = ?, status = ?
       WHERE id = ?`,
      [
        name,
        email || null,
        mobile,
        validDesignationId || null,
        salary,
        joiningDate,
        isActive ? "active" : "inactive",
        id,
      ]
    );

    // Fetch updated employee
    const [updatedEmployee] = await pool.query(
      `SELECT 
        e.id,
        e.name,
        e.email,
        e.phone as mobile,
        d.name as designation,
        e.designation_id as designationId,
        e.salary,
        'monthly' as salaryType,
        e.joining_date as joiningDate,
        e.salary as grossAmount,
        0 as bonus,
        0 as loan,
        0 as tax,
        e.salary as netSalary,
        0 as absence,
        NULL as bankName,
        NULL as accountName,
        NULL as accountNo,
        NULL as address,
        NULL as nationalId,
        NULL as fatherName,
        NULL as motherName,
        NULL as bloodGroup,
        NULL as others,
        NULL as photoUrl,
        e.status = 'active' as isActive,
        e.created_at as createdAt,
        e.created_at as updatedAt,
        CONCAT('EMP', LPAD(e.id, 3, '0')) as empId
      FROM employees e
      LEFT JOIN designations d ON e.designation_id = d.id
      WHERE e.id = ?`,
      [id]
    );

    res.json({
      success: true,
      data: updatedEmployee[0],
      message: "Employee updated successfully",
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/hr/employee - Delete employee(s) - supports bulk delete
router.delete("/", authenticateToken, async (req, res, next) => {
  try {
    const { ids } = req.body;

    // Validation
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Please provide an array of employee IDs to delete",
      });
    }

    // Check if any employee has attendance records
    const [attendanceRecords] = await pool.query(
      `SELECT employee_id 
       FROM attendance 
       WHERE employee_id IN (?)
       LIMIT 1`,
      [ids]
    );

    if (attendanceRecords.length > 0) {
      return res.status(400).json({
        success: false,
        error:
          "Cannot delete employee(s) with existing attendance records. Consider marking as inactive instead.",
      });
    }

    // Check if employees exist
    const [existingEmployees] = await pool.query(
      `SELECT id FROM employees WHERE id IN (?)`,
      [ids]
    );

    if (existingEmployees.length === 0) {
      return res.status(404).json({
        success: false,
        error: "No employees found with the provided IDs",
      });
    }

    // Soft delete - mark as inactive
    const [result] = await pool.query(
      `UPDATE employees 
       SET status = 'inactive' 
       WHERE id IN (?)`,
      [ids]
    );

    res.json({
      success: true,
      data: {
        deletedCount: result.affectedRows,
      },
      message: `${result.affectedRows} employee(s) marked as inactive successfully`,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
