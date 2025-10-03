import { Router } from "express";
import { pool } from "../utils/db.js";
import { authenticateToken } from "../middlewares/auth.js";
import { exec } from "child_process";
import { promisify } from "util";
import fs from "fs/promises";
import path from "path";

const execAsync = promisify(exec);
const router = Router();

// Backup storage directory
const BACKUP_DIR = path.join(process.cwd(), "backups");

// Ensure backup directory exists
async function ensureBackupDir() {
  try {
    await fs.access(BACKUP_DIR);
  } catch {
    await fs.mkdir(BACKUP_DIR, { recursive: true });
  }
}

// GET /api/backup - Fetch all available backups
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    await ensureBackupDir();

    // Get list of backup files from directory
    const files = await fs.readdir(BACKUP_DIR);
    const backupFiles = files.filter(
      (f) => f.endsWith(".sql") || f.endsWith(".dump")
    );

    // Get file details
    const backups = await Promise.all(
      backupFiles.map(async (fileName) => {
        const filePath = path.join(BACKUP_DIR, fileName);
        const stats = await fs.stat(filePath);

        // Extract metadata from filename if follows pattern: backup_YYYY-MM-DD_HH-MM-SS.sql
        const match = fileName.match(
          /backup_(\d{4}-\d{2}-\d{2}_\d{2}-\d{2}-\d{2})/
        );
        const timestamp = match
          ? new Date(match[1].replace("_", "T").replace(/-/g, ":"))
          : stats.birthtime;

        return {
          id: fileName,
          fileName,
          createdAt: timestamp.toISOString(),
          createdBy: "System", // Could be enhanced to track actual user
          size: stats.size,
        };
      })
    );

    // Sort by creation date (newest first)
    backups.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    res.json({
      success: true,
      data: backups,
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/backup/generate - Generate new database backup
router.post("/generate", authenticateToken, async (req, res, next) => {
  try {
    await ensureBackupDir();

    const timestamp = new Date()
      .toISOString()
      .replace(/:/g, "-")
      .replace(/\..+/, "")
      .replace("T", "_");

    const fileName = `backup_${timestamp}.sql`;
    const filePath = path.join(BACKUP_DIR, fileName);

    // MySQL connection details (from environment variables)
    // const DB_HOST = process.env.DB_HOST || "localhost";
    // const DB_USER = process.env.DB_USER || "root";
    // const DB_PASSWORD = process.env.DB_PASSWORD || "";
    // const DB_NAME = process.env.DB_NAME || "ammamricemill";

    // Create mysqldump command
    const dumpCommand = `mysqldump -h ${DB_HOST} -u ${DB_USER} ${
      DB_PASSWORD ? `-p${DB_PASSWORD}` : ""
    } ${DB_NAME} > ${filePath}`;

    // Execute backup
    await execAsync(dumpCommand);

    // Verify backup was created
    const stats = await fs.stat(filePath);

    res.json({
      success: true,
      data: {
        id: fileName,
        fileName,
        createdAt: new Date().toISOString(),
        createdBy: req.user?.name || "System",
        size: stats.size,
      },
      message: "Database backup created successfully",
    });
  } catch (err) {
    console.error("Backup generation error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to generate backup. Please check database configuration.",
    });
  }
});

// GET /api/backup/download/:fileName - Download a backup file
router.get("/download/:fileName", authenticateToken, async (req, res, next) => {
  try {
    const { fileName } = req.params;

    // Security: Prevent path traversal
    if (fileName.includes("..") || fileName.includes("/")) {
      return res.status(400).json({
        success: false,
        error: "Invalid file name",
      });
    }

    const filePath = path.join(BACKUP_DIR, fileName);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({
        success: false,
        error: "Backup file not found",
      });
    }

    // Send file for download
    res.download(filePath, fileName, (err) => {
      if (err) {
        console.error("Download error:", err);
        if (!res.headersSent) {
          res.status(500).json({
            success: false,
            error: "Failed to download backup file",
          });
        }
      }
    });
  } catch (err) {
    next(err);
  }
});

// POST /api/backup/restore - Restore database from backup file
router.post("/restore", authenticateToken, async (req, res, next) => {
  try {
    const { fileName } = req.body;

    if (!fileName) {
      return res.status(400).json({
        success: false,
        error: "Backup file name is required",
      });
    }

    // Security: Prevent path traversal
    if (fileName.includes("..") || fileName.includes("/")) {
      return res.status(400).json({
        success: false,
        error: "Invalid file name",
      });
    }

    const filePath = path.join(BACKUP_DIR, fileName);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({
        success: false,
        error: "Backup file not found",
      });
    }

    // MySQL connection details
    const DB_HOST = process.env.DB_HOST || "localhost";
    const DB_USER = process.env.DB_USER || "root";
    const DB_PASSWORD = process.env.DB_PASSWORD || "";
    const DB_NAME = process.env.DB_NAME || "rice_mill";

    // Create restore command
    const restoreCommand = `mysql -h ${DB_HOST} -u ${DB_USER} ${
      DB_PASSWORD ? `-p${DB_PASSWORD}` : ""
    } ${DB_NAME} < ${filePath}`;

    // Execute restore
    await execAsync(restoreCommand);

    res.json({
      success: true,
      message: "Database restored successfully from backup",
    });
  } catch (err) {
    console.error("Restore error:", err);
    res.status(500).json({
      success: false,
      error: "Failed to restore database. Please check the backup file.",
    });
  }
});

// DELETE /api/backup/:fileName - Delete a backup file
router.delete("/:fileName", authenticateToken, async (req, res, next) => {
  try {
    const { fileName } = req.params;

    // Security: Prevent path traversal
    if (fileName.includes("..") || fileName.includes("/")) {
      return res.status(400).json({
        success: false,
        error: "Invalid file name",
      });
    }

    const filePath = path.join(BACKUP_DIR, fileName);

    // Check if file exists
    try {
      await fs.access(filePath);
    } catch {
      return res.status(404).json({
        success: false,
        error: "Backup file not found",
      });
    }

    // Delete the file
    await fs.unlink(filePath);

    res.json({
      success: true,
      message: "Backup file deleted successfully",
    });
  } catch (err) {
    next(err);
  }
});

export default router;
