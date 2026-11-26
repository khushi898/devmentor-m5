import express from "express";
import {protect} from "../middleware/authMiddleware.js";
import { aiLimiter } from "../middleware/rateLimit.js";
import {agentChat} from "../controllers/agentController.js";


const router=express.Router();

router.post("/",protect,aiLimiter,agentChat);
export default router;