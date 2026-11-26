import express from "express";
import {protect} from "../middleware/authMiddleware.js";
import { aiLimiter } from "../middleware/rateLimit.js";
import { chat } from "../controllers/chatController.js";
const router=express.Router();

router.post("/",protect,aiLimiter,chat);
export default router;