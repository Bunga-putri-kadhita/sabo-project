import express from "express";

import {
  getMechanics,
  getMechanicById,
  createMechanic,
  updateMechanic,
  deleteMechanic,
} from "../controllers/mechanic.controller.js";

import { authenticate } from "../middlewares/auth.middleware.js";
import { authorize } from "../middlewares/role.middleware.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getMechanics);
router.get("/:id", getMechanicById);

router.post("/", authorize("ADMIN"), createMechanic);
router.put("/:id", authorize("ADMIN"), updateMechanic);
router.delete("/:id", authorize("ADMIN"), deleteMechanic);

export default router;
