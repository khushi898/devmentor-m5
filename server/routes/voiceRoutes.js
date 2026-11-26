import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { aiLimiter } from "../middleware/rateLimit.js";
import audioUpload from "../middleware/audioUpload.js";
import { transcribeAudio,answerQuestion } from "../controllers/voiceController.js";

const router=express.Router();

router.use(protect);
router.post("/transcribe", aiLimiter,audioUpload.single("audio"),transcribeAudio);
router.post("/answer",aiLimiter,answerQuestion);

export default router;