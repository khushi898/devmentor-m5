import Quiz from "../models/Quiz.js";
import { validAnswers, gradeQuiz, publicQuizView } from "../services/quizService.js";

const findSharedQuiz = (shareId) => Quiz.findOne({ shareId, isPublic: true });

export const getSharedQuiz = async (req, res) => {
  const quiz = await findSharedQuiz(req.params.shareId);
  if (!quiz) {
    return res.status(404).json({ message: "This quiz link is not available." });
  }
  res.json({ quiz: publicQuizView(quiz) });
};

export const checkSharedQuiz = async (req, res) => {
  const quiz = await findSharedQuiz(req.params.shareId);
  if (!quiz) {
    return res.status(404).json({ message: "This quiz link is not available." });
  }

  const { answers } = req.body || {};
  if (!validAnswers(quiz, answers)) {
    return res.status(400).json({ message: "Answer every question before submitting" });
  }

  const { results, score, total } = gradeQuiz(quiz, answers);
  res.json({ score, total, results });
};