import express from "express";
import partyTypes from "./partyTypes.js";

const router = express.Router();

router.use(partyTypes);

export default router;
