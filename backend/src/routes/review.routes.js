import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  createReview,
  getMyReviews,
} from "../controllers/review.controller.js";

const router = express.Router();

router.use(authenticate);

router.get("/", getMyReviews);
router.post("/", createReview);

export default router;
