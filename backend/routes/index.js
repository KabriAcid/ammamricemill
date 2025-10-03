import express from "express";
import partyRoutes from "./party/index.js";
import dashboardRoutes from "./dashboard.js";
import generalSettingsRoutes from "./settings/general.js";
import uploadRoutes from "./settings/upload.js";
import godownSettingsRoutes from "./settings/godown.js";
import siloSettingsRoutes from "./settings/silo.js";

const router = express.Router();

router.use("/party", partyRoutes);
router.use("/dashboard", dashboardRoutes);
router.use("/settings/general", generalSettingsRoutes);
router.use("/settings/upload", uploadRoutes);
router.use("/settings/godown", godownSettingsRoutes);
router.use("/settings/silo", siloSettingsRoutes);

export default router;
