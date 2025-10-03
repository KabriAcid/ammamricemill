import { Router } from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = Router();

// GET /api/general  → fetch settings
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const [rows] = await pool.query(`
      SELECT 
        id,
        company_name,
        address,
        phone,
        email,
        tax_rate,
        currency,
        timezone,
        date_format,
        logo_url,
        favicon_url,
        updated_at
      FROM settings 
      LIMIT 1
    `);
    res.json({ success: true, data: rows[0] || {} });
  } catch (err) {
    next(err);
  }
});

// POST /api/general  → create settings (only if none exists)
router.post("/", authenticateToken, async (req, res, next) => {
  try {
    const {
      company_name,
      address,
      phone,
      email,
      tax_rate,
      currency,
      timezone,
      date_format,
      logo_url,
      favicon_url,
    } = req.body;

    // Check if settings already exist
    const [rows] = await pool.query("SELECT id FROM settings LIMIT 1");

    if (rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Settings already exist. Use PUT to update.",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO settings 
       (company_name, address, phone, email, tax_rate, 
        currency, timezone, date_format, logo_url, favicon_url, created_at, updated_at) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        company_name,
        address,
        phone,
        email,
        tax_rate,
        currency,
        timezone,
        date_format,
        logo_url,
        favicon_url,
      ]
    );

    res.json({
      success: true,
      message: "Settings created",
      id: result.insertId,
    });
  } catch (err) {
    next(err);
  }
});

// PUT /api/general/:id  → update settings
router.put("/:id", authenticateToken, async (req, res, next) => {
  try {
    const {
      company_name,
      address,
      phone,
      email,
      tax_rate,
      currency,
      timezone,
      date_format,
      logo_url,
      favicon_url,
    } = req.body;

    const { id } = req.params;

    const [result] = await pool.query(
      `UPDATE settings 
       SET company_name=?, address=?, phone=?, email=?, tax_rate=?, 
           currency=?, timezone=?, date_format=?, 
           logo_url=?, favicon_url=?, updated_at=NOW() 
       WHERE id=?`,
      [
        company_name,
        address,
        phone,
        email,
        tax_rate,
        currency,
        timezone,
        date_format,
        logo_url,
        favicon_url,
        id,
      ]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({
        success: false,
        message: "Settings not found",
      });
    }

    res.json({ success: true, message: "Settings updated" });
  } catch (err) {
    next(err);
  }
});

export default router;
