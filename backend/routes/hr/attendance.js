import { Router } from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = Router();

// GET /api/hr/attendance - Fetch all attendance records with pagination and search
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const {
      page = 1,
      pageSize = 25,
      search = "",
      date = "",
      employeeId = "",
      limit = "",
    } = req.query;

    // If employeeId is provided, return employee-specific attendance
    if (employeeId) {
      const recordLimit = limit ? parseInt(limit) : 10;
      const [employeeAttendance] = await pool.query(
        `SELECT 
          a.id,
          a.date,
          a.status,
          a.check_in as checkIn,
          a.check_out as checkOut,
          a.working_hours as workHours,
          a.notes
        FROM attendance a
        WHERE a.employee_id = ?
        ORDER BY a.date DESC
        LIMIT ?`,
        [employeeId, recordLimit]
      );

      return res.json({
        success: true,
        data: employeeAttendance,
      });
    }

    const offset = (parseInt(page) - 1) * parseInt(pageSize);
    const limitValue = parseInt(pageSize);

    // Build search condition
    let searchCondition = "WHERE 1=1";
    const searchParams = [];

    if (date) {
      searchCondition += " AND date = ?";
      searchParams.push(date);
    }

    if (search) {
      searchCondition +=
        " AND (DATE_FORMAT(date, '%Y-%m-%d') LIKE ? OR notes LIKE ?)";
      searchParams.push(`%${search}%`, `%${search}%`);
    }

    // Get total count for the date
    const [[{ total }]] = await pool.query(
      `SELECT COUNT(DISTINCT date) as total 
       FROM attendance 
       ${searchCondition}`,
      searchParams
    );

    // Get attendance summary by date
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
      ${searchCondition}
      GROUP BY date
      ORDER BY date DESC
      LIMIT ? OFFSET ?`,
      [...searchParams, limitValue, offset]
    );

    // Get detailed employee records for each date
    const attendancesWithEmployees = await Promise.all(
      attendances.map(async (att) => {
        const [employees] = await pool.query(
          `SELECT 
            a.employee_id as employeeId,
            e.name as employeeName,
            a.status,
            a.check_in as inTime,
            a.check_out as outTime,
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
      data: {
        attendances: attendancesWithEmployees,
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

    // Handle each employee's attendance individually to support both insert and update
    if (employees && employees.length > 0) {
      for (const emp of employees) {
        // Check if attendance exists for this employee and date
        const [[existing]] = await pool.query(
          "SELECT id FROM attendance WHERE employee_id = ? AND date = ?",
          [emp.employeeId, date]
        );

        if (existing) {
          // Update existing record
          await pool.query(
            `UPDATE attendance 
             SET status = ?, 
                 check_in = ?, 
                 check_out = ?, 
                 working_hours = ?,
                 notes = ?
             WHERE employee_id = ? AND date = ?`,
            [
              emp.status || "present",
              emp.inTime || null,
              emp.outTime || null,
              emp.overtime || 0,
              emp.notes || description || null,
              emp.employeeId,
              date,
            ]
          );
        } else {
          // Insert new record
          await pool.query(
            `INSERT INTO attendance 
             (employee_id, date, status, check_in, check_out, working_hours, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
              emp.employeeId,
              date,
              emp.status || "present",
              emp.inTime || null,
              emp.outTime || null,
              emp.overtime || 0,
              emp.notes || description || null,
            ]
          );
        }
      }
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
        emp.inTime || null,
        emp.outTime || null,
        emp.overtime || 0,
        emp.notes || description || null,
      ]);

      await pool.query(
        `INSERT INTO attendance (employee_id, date, status, check_in, check_out, working_hours, notes) 
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
