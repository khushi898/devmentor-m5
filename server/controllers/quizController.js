import mongoose from "mongoose";
import { generateText, Output } from "ai";
import { groq } from "@ai-sdk/groq";
import Document from "../models/Document.js";
import Quiz from "../models/Quiz.js";
import { searchChunks } from "../services/vectorService.js";
import { quizSchema } from "../ai/schemas/quizSchema.js";
import { QUIZ_PROMPT } from "../ai/prompts/quizPrompt.js";
import QuizAttempt from "../models/QuizAttempt.js";

const hideAnswers = (quiz) => ({
  _id: quiz._id,
  title: quiz.title,
  topic: quiz.topic,
  document: quiz.document,
  createdAt: quiz.createdAt,
  questions: quiz.questions.map((q) => ({
    _id: q._id,
    question: q.question,
    options: q.options,
    page: q.page,
  })),
});

export const generateQuiz = async (req, res) => {
  const { documentId, topic } = req.body || {};
  const cleanTopic = topic?.trim() || "";

  if (!documentId && !cleanTopic) {
    return res.status(400).json({ message: "Choose a document or type a topic" });
  }

  let title = `Topic: ${cleanTopic}`;
  if (documentId) {
    if (!mongoose.isValidObjectId(documentId)) {
      return res.status(400).json({ message: "Invalid document" });
    }
    const doc = await Document.findOne({ _id: documentId, user: req.user._id, status: "ready" });
    if (!doc) {
      return res.status(404).json({ message: "Document not found" });
    }
    title = cleanTopic ? `${doc.title}: ${cleanTopic}` : doc.title;
  }

  const query = cleanTopic || "key concepts, definitions, rules and code examples";
  const matches = await searchChunks(req.user._id, query, documentId, {
    topK: 10,
    minScore: cleanTopic ? 0.25 : 0,
  });

  if (matches.length === 0) {
    return res.status(404).json({ message: "No material about this topic was found in your documents" });
  }

  const context = matches.map((m) => `(${m.title}, page ${m.page})\n${m.chunk_text}`).join("\n\n");

  let output;
  try {
    ({ output } = await generateText({
      model: groq(process.env.GROQ_MODEL),
      output: Output.object({ schema: quizSchema }),
      system: QUIZ_PROMPT,
      prompt: `Study material:\n${context}`,
      temperature: 0.3,
      maxOutputTokens: 3000,
      providerOptions: { groq: { reasoningEffort: "low" } },
    }));
  } catch (error) {
    console.error("Quiz generation error:", error.message);
    return res.status(502).json({ message: "Could not generate a quiz. Please try again." });
  }

  const questions = output.questions
    .filter((q) => q.options.length === 4 && Number.isInteger(q.correctIndex) && q.correctIndex >= 0 && q.correctIndex <= 3)
    .slice(0, 10);

  if (questions.length < 5) {
    return res.status(502).json({ message: "The AI returned too few valid questions. Please try again." });
  }

  const quiz = await Quiz.create({
    user: req.user._id,
    document: documentId || null,
    title,
    topic: cleanTopic,
    questions,
  });

  res.status(201).json({ quiz: hideAnswers(quiz), raw: output });
};

export const getQuizzes = async (req, res) => {
  const quizzes = await Quiz.find({ user: req.user._id }).select("title topic createdAt questions").sort({ createdAt: -1 });
  res.json({
    quizzes: quizzes.map((q) => ({ _id: q._id, title: q.title, topic: q.topic, createdAt: q.createdAt, total: q.questions.length })),
  });
};

export const getQuiz = async (req, res) => {
  const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user._id });
  if (!quiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }
  res.json({ quiz: hideAnswers(quiz) });
};

export const submitAttempt = async (req, res) => {
  const { answers } = req.body || {};

  const quiz = await Quiz.findOne({ _id: req.params.id, user: req.user._id });
  if (!quiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }

  const isValid =
    Array.isArray(answers) &&
    answers.length === quiz.questions.length &&
    answers.every((a) => Number.isInteger(a) && a >= 0 && a <= 3);

  if (!isValid) {
    return res.status(400).json({ message: "Answer every question before submitting" });
  }

  const results = quiz.questions.map((q, i) => ({
    question: q.question,
    options: q.options,
    selected: answers[i],
    correctIndex: q.correctIndex,
    correct: answers[i] === q.correctIndex,
    explanation: q.explanation,
    page: q.page,
  }));

  const score = results.filter((r) => r.correct).length;

  const attempt = await QuizAttempt.create({
    user: req.user._id,
    quiz: quiz._id,
    answers,
    score,
    total: quiz.questions.length,
  });

  res.status(201).json({ attempt, results });
};

export const getAttempts = async (req, res) => {
  const attempts = await QuizAttempt.find({ quiz: req.params.id, user: req.user._id })
    .select("score total createdAt")
    .sort({ createdAt: -1 });
  res.json({ attempts });
};
export const deleteQuiz=async(req ,res)=>{
    const quiz=await Quiz.findOneAndDelete({ _id:req.params.id,user:req.user._id});
    if(!quiz){
        return res.status(404).json({message:"Quiz not found!"});
    }
    await QuizAttempt.deleteMany({quiz:quiz._id,user:req.user._id});
    res.json({message:"Quiz deleted"});
};
