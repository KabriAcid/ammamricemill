import { Router } from "express";
import { authenticateToken } from "../../middlewares/auth.js";

const router = Router();

// GET /api/sales/ledger - placeholder implementation
router.get("/", authenticateToken, async (req, res, next) => {
  try {
    // Placeholder: return empty ledger array. Replace with DB-backed implementation later.
    res.json({ success: true, data: [] });
  } catch (err) {
    next(err);
  }
});

// GET /api/sales/ledger/export - placeholder export endpoint
router.get("/export", authenticateToken, async (req, res, next) => {
  try {
    // Placeholder: no file generation yet. Return 204 No Content.
    res.status(204).end();
  } catch (err) {
    next(err);
  }
});

export default router;
