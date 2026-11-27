import express from "express";
import {protect} from "../middleware/authMiddleware.js";
import { aiLimiter } from "../middleware/rateLimit.js";
import { chat,evaluateAnswer } from "../controllers/chatController.js";
const router=express.Router();

router.post("/",protect,aiLimiter,chat);
router.post("/evaluate",protect,aiLimiter,evaluateAnswer);
export default router;