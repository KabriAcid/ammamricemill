import { Router } from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = Router();

// GET /api/general  → fetch settings
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM general_settings LIMIT 1");
    res.json({ success: true, data: rows[0] || {} });
  } catch (err) {
    next(err);
  }
});

// POST /api/general  → create settings (only if none exists)
router.post("/", authenticateToken, async (req, res, next) => {
  try {
    const {
      siteName,
      description,
      address,
      proprietor,
      proprietorEmail,
      contactNo,
      itemsPerPage,
      copyrightText,
      logoUrl,
      faviconUrl,
    } = req.body;

    // Check if settings already exist
    const [rows] = await pool.query("SELECT id FROM general_settings LIMIT 1");

    if (rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Settings already exist. Use PUT to update.",
      });
    }

    const [result] = await pool.query(
      `INSERT INTO general_settings 
       (site_name, description, address, proprietor, proprietor_email, contact_no, 
        items_per_page, copyright_text, 
        logo_url, favicon_url) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        siteName,
        description,
        address,
        proprietor,
        proprietorEmail,
        contactNo,
        itemsPerPage,
        copyrightText,
        logoUrl,
        faviconUrl,
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
      siteName,
      description,
      address,
      proprietor,
      proprietorEmail,
      contactNo,
      itemsPerPage,
      copyrightText,
      logoUrl,
      faviconUrl,
    } = req.body;

    const { id } = req.params;

    const [result] = await pool.query(
      `UPDATE general_settings 
       SET site_name=?, description=?, address=?, proprietor=?, proprietor_email=?, 
           contact_no=?, items_per_page=?, copyright_text=?, 
           logo_url=?, favicon_url=?, updated_at=NOW() 
       WHERE id=?`,
      [
        siteName,
        description,
        address,
        proprietor,
        proprietorEmail,
        contactNo,
        itemsPerPage,
        copyrightText,
        logoUrl,
        faviconUrl,
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
