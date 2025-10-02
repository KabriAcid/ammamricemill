import { Router } from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = Router();

// GET /api/hr/attendance - Fetch all attendance records
// Optional: Support date range filter for large datasets
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const { fromDate, toDate } = req.query;

    // Build date filter if provided
    let dateCondition = "";
    const params = [];

    if (fromDate && toDate) {
      dateCondition = "WHERE date BETWEEN ? AND ?";
      params.push(fromDate, toDate);
    } else if (fromDate) {
      dateCondition = "WHERE date >= ?";
      params.push(fromDate);
    } else if (toDate) {
      dateCondition = "WHERE date <= ?";
      params.push(toDate);
    }

    // Get attendance summary by date - frontend handles search/filter/pagination
    const [attendances] = await pool.query(
      `SELECT 
        MIN(id) as id,
        date,
        COUNT(DISTINCT employee_id) as totalEmployee,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as totalPresent,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as totalAbsent,
        SUM(CASE WHEN status = 'leave' THEN 1 ELSE 0 END) as totalLeave,
        GROUP_CONCAT(DISTINCT notes SEPARATOR ', ') as description,
        MIN(created_at) as createdAt,
        MAX(created_at) as updatedAt
      FROM attendance
      ${dateCondition}
      GROUP BY date
      ORDER BY date DESC`,
      params
    );

    // Get detailed employee records for each date
    const attendancesWithEmployees = await Promise.all(
      attendances.map(async (att) => {
        const [employees] = await pool.query(
          `SELECT 
            a.employee_id as employeeId,
            e.name as employeeName,
            a.status,
            a.working_hours as overtime,
            a.notes
          FROM attendance a
          LEFT JOIN employees e ON a.employee_id = e.id
          WHERE a.date = ?`,
          [att.date]
        );

        return {
          ...att,
          employees,
        };
      })
    );

    res.json({
      success: true,
      data: attendancesWithEmployees,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/hr/attendance/:date - Fetch attendance for specific date
router.get("/:date", authenticateToken, async (req, res, next) => {
  try {
    const { date } = req.params;

    // Get summary for the date
    const [[summary]] = await pool.query(
      `SELECT 
        MIN(id) as id,
        date,
        COUNT(DISTINCT employee_id) as totalEmployee,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as totalPresent,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as totalAbsent,
        SUM(CASE WHEN status = 'leave' THEN 1 ELSE 0 END) as totalLeave,
        GROUP_CONCAT(DISTINCT notes SEPARATOR ', ') as description,
        MIN(created_at) as createdAt,
        MAX(created_at) as updatedAt
      FROM attendance
      WHERE date = ?
      GROUP BY date`,
      [date]
    );

    if (!summary) {
      return res.status(404).json({
        success: false,
        error: "Attendance record not found for this date",
      });
    }

    // Get employee details
    const [employees] = await pool.query(
      `SELECT 
        a.employee_id as employeeId,
        e.name as employeeName,
        a.status,
        a.working_hours as overtime,
        a.notes
      FROM attendance a
      LEFT JOIN employees e ON a.employee_id = e.id
      WHERE a.date = ?`,
      [date]
    );

    res.json({
      success: true,
      data: {
        ...summary,
        employees,
      },
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/hr/attendance - Create new attendance record
router.post("/", authenticateToken, async (req, res, next) => {
  try {
    const {
      date,
      totalEmployee,
      totalPresent,
      totalAbsent,
      totalLeave,
      description,
      employees,
    } = req.body;

    // Validation
    if (!date || !totalEmployee) {
      return res.status(400).json({
        success: false,
        error: "Date and total employee count are required",
      });
    }

    if (totalEmployee <= 0) {
      return res.status(400).json({
        success: false,
        error: "Total employee must be greater than 0",
      });
    }

    // Check if attendance already exists for this date
    const [[existing]] = await pool.query(
      "SELECT COUNT(*) as count FROM attendance WHERE date = ?",
      [date]
    );

    if (existing.count > 0) {
      return res.status(400).json({
        success: false,
        error: "Attendance record already exists for this date",
      });
    }

    // Insert attendance records for each employee
    if (employees && employees.length > 0) {
      const values = employees.map((emp) => [
        emp.employeeId,
        date,
        emp.status || "present",
        emp.overtime || 0,
        emp.notes || description || null,
      ]);

      await pool.query(
        `INSERT INTO attendance (employee_id, date, status, working_hours, notes) 
         VALUES ?`,
        [values]
      );
    }

    // Fetch the newly created attendance summary
    const [[newAttendance]] = await pool.query(
      `SELECT 
        MIN(id) as id,
        date,
        COUNT(DISTINCT employee_id) as totalEmployee,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as totalPresent,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as totalAbsent,
        SUM(CASE WHEN status = 'leave' THEN 1 ELSE 0 END) as totalLeave,
        GROUP_CONCAT(DISTINCT notes SEPARATOR ', ') as description,
        MIN(created_at) as createdAt,
        MAX(created_at) as updatedAt
      FROM attendance
      WHERE date = ?
      GROUP BY date`,
      [date]
    );

    res.status(201).json({
      success: true,
      data: newAttendance,
      message: "Attendance record created successfully",
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/hr/attendance/:date - Update attendance for a specific date
router.put("/:date", authenticateToken, async (req, res, next) => {
  try {
    const { date: paramDate } = req.params;
    const {
      date,
      totalEmployee,
      totalPresent,
      totalAbsent,
      totalLeave,
      description,
      employees,
    } = req.body;

    // Validation
    if (!date || !totalEmployee) {
      return res.status(400).json({
        success: false,
        error: "Date and total employee count are required",
      });
    }

    // Check if attendance exists
    const [[existing]] = await pool.query(
      "SELECT COUNT(*) as count FROM attendance WHERE date = ?",
      [paramDate]
    );

    if (existing.count === 0) {
      return res.status(404).json({
        success: false,
        error: "Attendance record not found",
      });
    }

    // Delete existing records for this date
    await pool.query("DELETE FROM attendance WHERE date = ?", [paramDate]);

    // Insert updated records
    if (employees && employees.length > 0) {
      const values = employees.map((emp) => [
        emp.employeeId,
        date,
        emp.status || "present",
        emp.overtime || 0,
        emp.notes || description || null,
      ]);

      await pool.query(
        `INSERT INTO attendance (employee_id, date, status, working_hours, notes) 
         VALUES ?`,
        [values]
      );
    }

    // Fetch updated attendance
    const [[updatedAttendance]] = await pool.query(
      `SELECT 
        MIN(id) as id,
        date,
        COUNT(DISTINCT employee_id) as totalEmployee,
        SUM(CASE WHEN status = 'present' THEN 1 ELSE 0 END) as totalPresent,
        SUM(CASE WHEN status = 'absent' THEN 1 ELSE 0 END) as totalAbsent,
        SUM(CASE WHEN status = 'leave' THEN 1 ELSE 0 END) as totalLeave,
        GROUP_CONCAT(DISTINCT notes SEPARATOR ', ') as description,
        MIN(created_at) as createdAt,
        MAX(created_at) as updatedAt
      FROM attendance
      WHERE date = ?
      GROUP BY date`,
      [date]
    );

    res.json({
      success: true,
      data: updatedAttendance,
      message: "Attendance record updated successfully",
    });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/hr/attendance - Delete attendance record(s) by date(s)
router.delete("/", authenticateToken, async (req, res, next) => {
  try {
    const { dates } = req.body;

    // Validation
    if (!dates || !Array.isArray(dates) || dates.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Please provide an array of dates to delete",
      });
    }

    // Delete attendance records
    const [result] = await pool.query(
      `DELETE FROM attendance WHERE date IN (?)`,
      [dates]
    );

    res.json({
      success: true,
      data: {
        deletedCount: result.affectedRows,
      },
      message: `${result.affectedRows} attendance record(s) deleted successfully`,
    });
  } catch (err) {
    next(err);
  }
});

export default router;
