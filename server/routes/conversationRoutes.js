import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  createConversation,
  getConversations,
  getConversation,
  deleteConversation,
} from "../controllers/conversationController.js";

const router = express.Router();

router.use(protect);
router.get("/", getConversations);
router.post("/", createConversation);
router.get("/:id", getConversation);
router.delete("/:id", deleteConversation);

export default router;