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

// Verify environment variables
console.log("Environment check:");
console.log("JWT_SECRET exists:", !!JWT_SECRET);
console.log("REFRESH_TOKEN_SECRET exists:", !!REFRESH_TOKEN_SECRET);

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

    console.log("Attempting login for email:", email);

    const [rows] = await pool.query(
      "SELECT id, name, email, password_hash, role, status FROM users WHERE email = ?",
      [email]
    );

    console.log("Query result:", rows);

    const user = rows[0];

    if (!user) {
      console.log("No user found with email:", email);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    console.log("Found user:", { ...user, password_hash: "[HIDDEN]" });

    if (user.status !== "active") {
      return res.status(403).json({
        success: false,
        message: "Account is inactive. Please contact administrator.",
      });
    }

    try {
      console.log("Attempting password verification");
      const valid = await verifyPassword(password, user.password_hash);
      console.log("Password verification result:", valid);

      if (!valid) {
        console.log("Password verification failed");
        return res.status(401).json({
          success: false,
          message: "Invalid email or password",
        });
      }
      console.log("Password verification successful");
    } catch (error) {
      console.error("Password verification error:", error);
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    console.log("Creating tokens...");
    try {
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
      console.log("Access token created");

      const refreshToken = jwt.sign({ id: user.id }, REFRESH_TOKEN_SECRET, {
        expiresIn: REFRESH_TOKEN_EXPIRES_IN,
      });
      console.log("Refresh token created");

      // Set cookies with secure options
      console.log("Setting cookies...");
      console.log("Cookie options:", {
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        domain:
          process.env.NODE_ENV === "production"
            ? process.env.DOMAIN
            : "localhost",
      });
      const tokenCookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        maxAge: 24 * 60 * 60 * 1000, // 24 hours
        path: "/",
      };

      const refreshTokenCookieOptions = {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
        path: "/api/auth/refresh",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
      };

      console.log(
        "Setting access token cookie with options:",
        tokenCookieOptions
      );
      res.cookie("token", accessToken, tokenCookieOptions);

      console.log(
        "Setting refresh token cookie with options:",
        refreshTokenCookieOptions
      );
      res.cookie("refreshToken", refreshToken, refreshTokenCookieOptions);
      console.log("Cookies set successfully");

      console.log("Sending response...");
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
      console.log("Response sent successfully");
    } catch (error) {
      console.error("Error in final login steps:", error);
      return res.status(500).json({
        success: false,
        message: "Error completing login process",
      });
    }
  } catch (err) {
    console.error("Error in login route:", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error during login",
      error: err.message,
    });
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
  // Clear access token with same options used when setting
  res.clearCookie("token", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    path: "/",
  });

  // Clear refresh token with same options used when setting
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
    path: "/api/auth/refresh",
  });

  // Send success response
  res.json({
    success: true,
    message: "Logged out successfully",
  });
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
