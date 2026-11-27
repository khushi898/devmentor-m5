import express from "express";
import { publicLimiter } from "../middleware/rateLimit.js";
import { getSharedQuiz, checkSharedQuiz } from "../controllers/publicController.js";

const router = express.Router();

router.use(publicLimiter);
router.get("/quizzes/:shareId", getSharedQuiz);
router.post("/quizzes/:shareId/check", checkSharedQuiz);

export default router;