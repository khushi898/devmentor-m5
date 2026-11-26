import mongoose from "mongoose";
import { generateText, transcribe } from "ai";
import { groq } from "@ai-sdk/groq";
import { searchChunks } from "../services/vectorService.js";
import { VOICE_PROMPT } from "../ai/prompts/voicePrompt.js";

export const transcribeAudio = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "No recording received" });
  }

  try {
    const result = await transcribe({
      model: groq.transcription(process.env.GROQ_WHISPER_MODEL || "whisper-large-v3-turbo"),
      audio: req.file.buffer,
      providerOptions: { groq: { language: "en" } },
    });

    const text = result.text?.trim();
    if (!text) {
      return res.status(422).json({ message: "I couldn't hear any speech. Please try again." });
    }

    res.json({ text });
  } catch (error) {
    console.error("Transcription error:", error.message);
    res.status(502).json({ message: "Could not transcribe your recording. Please try again." });
  }
};

export const answerQuestion = async (req, res) => {
  const { question, documentId } = req.body || {};
  const cleanQuestion = question?.trim();

  if (!cleanQuestion) {
    return res.status(400).json({ message: "A question is required" });
  }
  if (documentId && !mongoose.isValidObjectId(documentId)) {
    return res.status(400).json({ message: "Invalid document" });
  }

  let matches = [];
  try {
    matches = await searchChunks(req.user._id, cleanQuestion, documentId);
  } catch (error) {
    console.error("Search error:", error.message);
  }

  const sources = matches.map((m, i) => ({ id: i + 1, title: m.title, page: m.page }));
  const context = matches.map((m, i) => `[${i + 1}] (${m.title}, page ${m.page})\n${m.chunk_text}`).join("\n\n");

  try {
    const { text } = await generateText({
      model: groq(process.env.GROQ_MODEL),
      system: VOICE_PROMPT,
      prompt: `Study material:\n${context || "(No relevant material was found.)"}\n\nQuestion: ${cleanQuestion}`,
      maxOutputTokens: 600,
      temperature: 0.2,
      providerOptions: { groq: { reasoningEffort: "low" } },
    });

    res.json({ answer: text, sources });
  } catch (error) {
    console.error("Voice answer error:", error.message);
    res.status(502).json({ message: "Could not answer right now. Please try again." });
  }
};