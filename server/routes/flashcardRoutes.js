import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { aiLimiter } from "../middleware/rateLimit.js";
import { generateFlashcards, getDecks, getDeck } from "../controllers/flashcardController.js";

const router = express.Router();

router.use(protect);
router.get("/", getDecks);
router.post("/generate", aiLimiter, generateFlashcards);
router.get("/:id", getDeck);

export default router;