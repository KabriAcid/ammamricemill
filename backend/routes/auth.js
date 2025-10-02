import express from "express";
import { pool } from "../utils/db.js";
import { hashPassword, verifyPassword } from "../utils/hash.js";
import jwt from "jsonwebtoken";

// Function to check if admin exists
const checkAdminExists = async () => {
  const [rows] = await pool.query(
    "SELECT COUNT(*) as count FROM users WHERE role = 'admin'"
  );
  return rows[0].count > 0;
};
import {
  ACCESS_TOKEN_EXPIRES_IN,
  REFRESH_TOKEN_EXPIRES_IN,
  JWT_SECRET,
  REFRESH_TOKEN_SECRET,
} from "../constants.js";

const router = express.Router();

// Login route
router.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    const [rows] = await pool.query(
      "SELECT id, name, email, password_hash, role, status FROM users WHERE email = ?",
      [email]
    );

    const user = rows[0];

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Account is inactive. Please contact administrator.",
      });
    }

    const valid = await verifyPassword(password, user.password_hash);
    if (!valid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const accessToken = jwt.sign(
      {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: ACCESS_TOKEN_EXPIRES_IN }
    );

    const refreshToken = jwt.sign({ id: user.id }, REFRESH_TOKEN_SECRET, {
      expiresIn: REFRESH_TOKEN_EXPIRES_IN,
    });
    // Set cookies with secure options
    res.cookie("token", accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/api/auth/refresh",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.json({
      success: true,
      data: {
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Verify token route
router.get("/verify", (req, res) => {
  const token = req.cookies.token;
  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "No token provided" });
  }

  try {
    jwt.verify(token, JWT_SECRET);
    res.json({ success: true });
  } catch (err) {
    res.status(401).json({ success: false, message: "Invalid token" });
  }
});

// Refresh token route
router.post("/refresh", (req, res, next) => {
  const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
  if (!refreshToken)
    return res.status(401).json({ message: "No refresh token" });
  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: "Invalid refresh token" });
    const accessToken = jwt.sign({ id: user.id }, JWT_SECRET, {
      expiresIn: ACCESS_TOKEN_EXPIRES_IN,
    });
    res.cookie("token", accessToken, { httpOnly: true, sameSite: "lax" });
    res.json({ accessToken });
  });
});

// Logout route
router.post("/logout", (req, res) => {
  res.clearCookie("token");
  res.clearCookie("refreshToken");
  res.json({ success: true, message: "Logged out successfully" });
});

// Setup initial admin account
router.post("/setup", async (req, res, next) => {
  try {
    const adminExists = await checkAdminExists();
    if (adminExists) {
      return res.status(400).json({
        success: false,
        message: "Admin account already exists",
      });
    }

    const { name, email, password } = req.body;

    // Validate required fields
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: "Invalid email format",
      });
    }

    // Check if email already exists
    const [existing] = await pool.query(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (existing.length > 0) {
      return res.status(400).json({
        success: false,
        message: "Email already registered",
      });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create admin user
    const [result] = await pool.query(
      `INSERT INTO users (name, email, password_hash, role, status) 
       VALUES (?, ?, ?, 'admin', 'active')`,
      [name, email, hashedPassword]
    );

    res.status(201).json({
      success: true,
      message: "Admin account created successfully",
      data: {
        id: result.insertId,
        name,
        email,
        role: "admin",
      },
    });
  } catch (err) {
    next(err);
  }
});

export default router;
