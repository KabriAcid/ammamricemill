import { Router } from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = Router();

// GET /api/employees
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM employees ORDER BY created_at DESC"
    );
    res.json({ success: true, data: rows });
  } catch (err) {
    next(err);
  }
});

// POST /api/employees
router.post("/", authenticateToken, async (req, res, next) => {
  try {
    const { name, role, email, phone, salary } = req.body;
    const [result] = await pool.query(
      "INSERT INTO employees (name, role, email, phone, salary) VALUES (?, ?, ?, ?, ?)",
      [name, role, email, phone, salary]
    );
    res.json({ success: true, message: "Employee added", id: result.insertId });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/employees/:id
router.delete("/:id", authenticateToken, async (req, res, next) => {
  try {
    const { id } = req.params;
    await pool.query("DELETE FROM employees WHERE id = ?", [id]);
    res.json({ success: true, message: "Employee deleted" });
  } catch (err) {
    next(err);
  }
});

export default router;
