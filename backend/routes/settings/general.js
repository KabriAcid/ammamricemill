import { Router } from "express";
import { pool } from "../../utils/db.js";
import { hashPassword } from "../../utils/hash.js";
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

router.post("/admin", authenticateToken, async (req, res, next) => {
  try {
    // Only super_admin can create new admins
    if (!req.user || req.user.role !== "super_admin") {
      return res.status(403).json({
        success: false,
        message: "You don't have permission to create new admins",
      });
    }

    const { full_name, email, phone, password, role, bio, address } = req.body;

    // Validation
    if (!full_name || !email || !phone || !password) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, phone, and password are required",
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Password validation
    if (password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 8 characters long",
      });
    }

    // Check if email already exists
    const [emailExists] = await pool.query(
      "SELECT id FROM admins WHERE email = ?",
      [email]
    );
    if (emailExists && emailExists.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email is already registered",
      });
    }

    // Hash password using argon2
    const passwordHash = await hashPassword(password);

    // Insert new admin
    const [result] = await pool.query(
      `INSERT INTO admins (
        full_name, 
        email, 
        phone, 
        password_hash, 
        role, 
        bio, 
        address,
        created_at,
        updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, NOW(), NOW())`,
      [
        full_name,
        email,
        phone,
        passwordHash,
        role || "admin",
        bio || null,
        address || null,
      ]
    );

    res.status(201).json({
      success: true,
      message: "New admin created successfully",
      id: result.insertId,
    });
  } catch (error) {
    console.error("Error creating new admin:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create new admin",
    });
  }
});

export default router;
