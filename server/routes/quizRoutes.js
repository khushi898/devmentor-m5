import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { aiLimiter } from "../middleware/rateLimit.js";
import { generateQuiz,getQuizzes, getQuiz, submitAttempt, getAttempts, deleteQuiz, setQuizSharing } from "../controllers/quizController.js";

const router=express.Router();

router.use(protect);
router.get("/",getQuizzes);
router.post("/generate",aiLimiter,generateQuiz);
router.get("/:id",getQuiz);
router.post("/:id/attempts",submitAttempt);
router.get("/:id/attempts",getAttempts);
router.delete("/:id",deleteQuiz);
router.patch("/:id/share",setQuizSharing);

export default router;