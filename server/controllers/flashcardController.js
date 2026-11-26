import mongoose from "mongoose";
import { generateText, Output } from "ai";
import { groq } from "@ai-sdk/groq";
import Document from "../models/Document.js";
import FlashcardDeck from "../models/FlashcardDeck.js";
import { searchChunks } from "../services/vectorService.js";
import { flashcardSetSchema } from "../ai/schemas/flashcardSchema.js";
import { FLASHCARD_PROMPT } from "../ai/prompts/flashcardPrompt.js";

export const generateFlashcards = async (req, res) => {
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

  const context = matches
    .map((m) => `(${m.title}, page ${m.page})\n${m.chunk_text}`)
    .join("\n\n");

  let output;
  try {
    ({ output } = await generateText({
      model: groq(process.env.GROQ_MODEL),
      output: Output.object({ schema: flashcardSetSchema }),
      system: FLASHCARD_PROMPT,
      prompt: `Study material:\n${context}`,
      temperature: 0.3,
      maxOutputTokens: 2500,
      providerOptions: { groq: { reasoningEffort: "low" } },
    }));
  } catch (error) {
    console.error("Flashcard generation error:", error.message);
    return res.status(502).json({ message: "Could not generate flashcards. Please try again." });
  }

  const deck = await FlashcardDeck.create({
    user: req.user._id,
    document: documentId || null,
    title,
    topic: cleanTopic,
    cards: output.flashcards.slice(0, 15),
  });

  res.status(201).json({ deck, raw: output });
};

export const getDecks = async (req, res) => {
  const decks = await FlashcardDeck.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ decks });
};

export const getDeck = async (req, res) => {
  const deck = await FlashcardDeck.findOne({ _id: req.params.id, user: req.user._id });
  if (!deck) {
    return res.status(404).json({ message: "Deck not found" });
  }
  res.json({ deck });
};
export const updateCardStatus = async (req, res) => {
  const { status } = req.body || {};
  if (!["new", "known", "unknown"].includes(status)) {
    return res.status(400).json({ message: "Status must be new, known or unknown" });
  }

  const deck = await FlashcardDeck.findOne({ _id: req.params.id, user: req.user._id });
  if (!deck) {
    return res.status(404).json({ message: "Deck not found" });
  }

  const card = deck.cards.id(req.params.cardId);
  if (!card) {
    return res.status(404).json({ message: "Card not found" });
  }

  card.status = status;
  await deck.save();
  res.json({ card });
};

export const deleteDeck = async (req, res) => {
  const deck = await FlashcardDeck.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!deck) {
    return res.status(404).json({ message: "Deck not found" });
  }
  res.json({ message: "Deck deleted" });
};