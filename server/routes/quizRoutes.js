import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { aiLimiter } from "../middleware/rateLimit.js";
import { generateQuiz,getQuizzes, getQuiz, submitAttempt, getAttempts } from "../controllers/quizController.js";

const router=express.Router();

router.use(protect);
router.get("/",getQuizzes);
router.post("/generate",aiLimiter,generateQuiz);
router.get("/:id",getQuiz);
router.post("/:id/attempts",submitAttempt);
router.get("/:id/attempts",getAttempts);

export default router;