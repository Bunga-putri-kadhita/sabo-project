import express from "express";

import { authenticate } from "../middlewares/auth.middleware.js";
import { getAdminList } from "../controllers/user.controller.js";

const router = express.Router();

// Semua endpoint user wajib login
router.use(authenticate);

// Mengambil daftar Admin
router.get("/admins", getAdminList);

export default router;
