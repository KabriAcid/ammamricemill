const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { hashPassword, verifyPassword } = require("../../utils/hash");

// Configure multer for avatar uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, "../../uploads/avatars");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      "avatar-" + uniqueSuffix + path.extname(file.originalname).toLowerCase()
    );
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed."
      ),
      false
    );
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: fileFilter,
});

// Middleware to authenticate admin
const authenticateAdmin = (req, res, next) => {
  // This is a placeholder - replace with your actual authentication middleware
  // Example: check JWT token, verify session, etc.
  if (!req.user || !req.user.id) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized. Please log in.",
    });
  }
  next();
};

// GET /api/admin/profile - Fetch admin profile
router.get("/profile", authenticateAdmin, async (req, res) => {
  try {
    const adminId = req.user.id;

    // Replace with your actual database query
    // This is a placeholder example
    const query = `
      SELECT 
        id, 
        full_name, 
        email, 
        phone, 
        role, 
        avatar_url, 
        bio, 
        address,
        created_at,
        updated_at
      FROM admins 
      WHERE id = ?
    `;

    // Example database call (replace with your actual DB implementation)
    const result = await req.db.query(query, [adminId]);

    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin profile not found",
      });
    }

    const admin = result[0];

    res.json({
      success: true,
      data: {
        id: admin.id,
        full_name: admin.full_name,
        email: admin.email,
        phone: admin.phone,
        role: admin.role,
        avatar_url: admin.avatar_url,
        bio: admin.bio,
        address: admin.address,
      },
    });
  } catch (error) {
    console.error("Error fetching admin profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch admin profile",
    });
  }
});

// PUT /api/admin/profile - Update admin profile
router.put("/profile", authenticateAdmin, async (req, res) => {
  try {
    const adminId = req.user.id;
    const { full_name, email, phone, bio, address } = req.body;

    // Validation
    if (!full_name || !email || !phone) {
      return res.status(400).json({
        success: false,
        message: "Full name, email, and phone are required",
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

    // Phone validation
    if (phone.length < 10) {
      return res.status(400).json({
        success: false,
        message: "Phone number must be at least 10 digits",
      });
    }

    // Check if email is already taken by another admin
    const emailCheckQuery = `
      SELECT id FROM admins 
      WHERE email = ? AND id != ?
    `;
    const emailExists = await req.db.query(emailCheckQuery, [email, adminId]);

    if (emailExists && emailExists.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email is already in use by another admin",
      });
    }

    // Update profile
    const updateQuery = `
      UPDATE admins 
      SET 
        full_name = ?,
        email = ?,
        phone = ?,
        bio = ?,
        address = ?,
        updated_at = NOW()
      WHERE id = ?
    `;

    await req.db.query(updateQuery, [
      full_name,
      email,
      phone,
      bio || null,
      address || null,
      adminId,
    ]);

    res.json({
      success: true,
      message: "Profile updated successfully",
    });
  } catch (error) {
    console.error("Error updating admin profile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update admin profile",
    });
  }
});

// PUT /api/admin/profile/password - Change admin password
router.put("/profile/password", authenticateAdmin, async (req, res) => {
  try {
    const adminId = req.user.id;
    const { current_password, new_password } = req.body;

    // Validation
    if (!current_password || !new_password) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      });
    }

    if (new_password.length < 8) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 8 characters long",
      });
    }

    if (current_password === new_password) {
      return res.status(400).json({
        success: false,
        message: "New password must be different from current password",
      });
    }

    // Get current password hash from database
    const query = `
      SELECT password_hash FROM admins WHERE id = ?
    `;
    const result = await req.db.query(query, [adminId]);

    if (!result || result.length === 0) {
      return res.status(404).json({
        success: false,
        message: "Admin not found",
      });
    }

    const currentPasswordHash = result[0].password_hash;

    // Verify current password using argon2
    const isPasswordValid = await verifyPassword(
      current_password,
      currentPasswordHash
    );

    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Current password is incorrect",
      });
    }

    // Hash new password using argon2
    const newPasswordHash = await hashPassword(new_password);

    // Update password
    const updateQuery = `
      UPDATE admins 
      SET 
        password_hash = ?,
        updated_at = NOW()
      WHERE id = ?
    `;

    await req.db.query(updateQuery, [newPasswordHash, adminId]);

    res.json({
      success: true,
      message: "Password changed successfully",
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({
      success: false,
      message: "Failed to change password",
    });
  }
});

// POST /api/settings/admin-profile/upload - Upload avatar
router.post(
  "/upload",
  authenticateAdmin,
  upload.single("avatar"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const adminId = req.user.id;
      const avatarUrl = `/uploads/avatars/${req.file.filename}`;

      // Get old avatar URL to delete it
      const query = `SELECT avatar_url FROM admins WHERE id = ?`;
      const result = await req.db.query(query, [adminId]);

      if (result && result.length > 0 && result[0].avatar_url) {
        const oldAvatarPath = path.join(
          __dirname,
          "../../",
          result[0].avatar_url
        );
        if (fs.existsSync(oldAvatarPath)) {
          fs.unlinkSync(oldAvatarPath);
        }
      }

      // Update avatar URL in database
      const updateQuery = `
        UPDATE admins 
        SET 
          avatar_url = ?,
          updated_at = NOW()
        WHERE id = ?
      `;

      await req.db.query(updateQuery, [avatarUrl, adminId]);

      res.json({
        success: true,
        url: avatarUrl,
        message: "Avatar uploaded successfully",
      });
    } catch (error) {
      console.error("Error uploading avatar:", error);

      // Delete uploaded file if database update fails
      if (req.file) {
        const filePath = req.file.path;
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
      }

      res.status(500).json({
        success: false,
        message: "Failed to upload avatar",
      });
    }
  }
);

// ...existing code...

// Error handling middleware for multer
router.use((error, req, res, next) => {
  if (error instanceof multer.MulterError) {
    if (error.code === "LIMIT_FILE_SIZE") {
      return res.status(400).json({
        success: false,
        message: "File size too large. Maximum size is 5MB.",
      });
    }
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  if (error.message.includes("Invalid file type")) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }

  next(error);
});

module.exports = router;
