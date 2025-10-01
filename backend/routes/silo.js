import express from "express";
import pool from "../db.js";
import { authenticateToken } from "../middlewares/auth.js";

const router = express.Router();

// GET all silos
router.get("/", authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT * FROM silos ORDER BY created_at DESC"
    );
    res.json(rows);
  } catch (error) {
    console.error("Error fetching silos:", error);
    res.status(500).json({ error: "Failed to fetch silos" });
  }
});

// GET single silo by ID
router.get("/:id", authenticateToken, async (req, res) => {
  try {
    const [rows] = await pool.query("SELECT * FROM silos WHERE id = ?", [
      req.params.id,
    ]);
    if (rows.length === 0)
      return res.status(404).json({ error: "Silo not found" });
    res.json(rows[0]);
  } catch (error) {
    console.error("Error fetching silo:", error);
    res.status(500).json({ error: "Failed to fetch silo" });
  }
});

// CREATE new silo
router.post("/", authenticateToken, async (req, res) => {
  try {
    const { name, capacity, description } = req.body;
    if (!name || !capacity) {
      return res.status(400).json({ error: "Name and capacity are required" });
    }

    const [result] = await pool.query(
      "INSERT INTO silos (name, capacity, description) VALUES (?, ?, ?)",
      [name, capacity, description || null]
    );

    res.status(201).json({ id: result.insertId, name, capacity, description });
  } catch (error) {
    console.error("Error creating silo:", error);
    res.status(500).json({ error: "Failed to create silo" });
  }
});

// UPDATE silo
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    const { name, capacity, description } = req.body;
    const { id } = req.params;

    const [result] = await pool.query(
      "UPDATE silos SET name = ?, capacity = ?, description = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [name, capacity, description || null, id]
    );

    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Silo not found" });
    res.json({ id, name, capacity, description });
  } catch (error) {
    console.error("Error updating silo:", error);
    res.status(500).json({ error: "Failed to update silo" });
  }
});

// DELETE silo
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    const [result] = await pool.query("DELETE FROM silos WHERE id = ?", [
      req.params.id,
    ]);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Silo not found" });
    res.json({ message: "Silo deleted successfully" });
  } catch (error) {
    console.error("Error deleting silo:", error);
    res.status(500).json({ error: "Failed to delete silo" });
  }
});

export default router;
