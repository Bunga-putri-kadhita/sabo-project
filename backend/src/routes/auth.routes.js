import express from "express";

import {
  register,
  login,
  getMe,
  adminTest,
} from "../controllers/auth.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";

import { authorize } from "../middlewares/role.middleware.js";

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/me", authenticate, getMe);

router.get("/admin-test", authenticate, authorize("ADMIN"), adminTest);

export default router;
