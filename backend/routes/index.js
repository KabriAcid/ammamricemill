import express from "express";
import partyRoutes from "./party/index.js";
// ...existing imports for other modules

const router = express.Router();

router.use("/party", partyRoutes);
// ...existing router.use for other modules

export default router;
