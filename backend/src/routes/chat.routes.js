import express from "express";
import { authenticate } from "../middlewares/auth.middleware.js";
import {
  sendMessage,
  getChatMessages,
} from "../controllers/chat.controller.js";

const router = express.Router();

router.use(authenticate);

router.get("/:bookingId", getChatMessages);
router.post("/:bookingId", sendMessage);

export default router;
