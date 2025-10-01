import { Router } from "express";
import { pool } from "../../utils/db.js";
import { authenticateToken } from "../../middlewares/auth.js";

const router = Router();

// GET /api/general
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    const [rows] = await pool.query("SELECT * FROM general_settings LIMIT 1");
    res.json({ success: true, data: rows[0] || {} });
  } catch (err) {
    next(err);
  }
});

// POST /api/general
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

    // Upsert logic: update if exists, otherwise insert
    const [rows] = await pool.query("SELECT id FROM general_settings LIMIT 1");

    if (rows.length > 0) {
      const id = rows[0].id;
      await pool.query(
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
      res.json({ success: true, message: "Settings updated" });
    } else {
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
        message: "Settings saved",
        id: result.insertId,
      });
    }
  } catch (err) {
    next(err);
  }
});

export default router;
