import express from "express";

import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
} from "../controllers/service.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = express.Router();

// Semua endpoint membutuhkan login.
router.use(authenticate);

// Semua role yang sudah login boleh melihat layanan.
router.get("/", getServices);
router.get("/:id", getServiceById);

// Hanya ADMIN boleh mengelola layanan.
router.post("/", authorize("ADMIN"), createService);
router.put("/:id", authorize("ADMIN"), updateService);
router.delete("/:id", authorize("ADMIN"), deleteService);

export default router;
