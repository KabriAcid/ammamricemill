import express from "express";
import partyRoutes from "./party/index.js";
import dashboardRoutes from "./dashboard.js";
// ...existing imports for other modules

const router = express.Router();

router.use("/party", partyRoutes);
router.use("/dashboard", dashboardRoutes);
// ...existing router.use for other modules

export default router;
