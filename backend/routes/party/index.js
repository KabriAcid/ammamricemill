import express from "express";
import partyTypes from "./party-types.js";

const router = express.Router();

router.use("/types", partyTypes);

export default router;
