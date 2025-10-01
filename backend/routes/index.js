import express from "express";
import authRoutes from "./auth.js";
// import other route files as needed

const router = express.Router();

router.use("/auth", authRoutes);
// router.use('/users', userRoutes);
// router.use('/other', otherRoutes);

export default router;
