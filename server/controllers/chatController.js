import {
  convertToModelMessages,
  createUIMessageStream,
  pipeUIMessageStreamToResponse,
  streamText,
  toUIMessageStream,
} from "ai";
import { groq } from "@ai-sdk/groq";
import { searchChunks } from "../services/vectorService.js";
import { buildChatPrompt } from "../ai/prompts/chatPrompt.js";
import mongoose from "mongoose";
import Conversation from "../models/Conversation.js";
import { generateText, Output } from "ai";
import { evaluationSchema } from "../ai/schemas/evaluationSchema.js";
import { EVALUATOR_PROMPT } from "../ai/prompts/evaluationPrompt.js";

export const chat = async (req, res) => {
  const { messages, documentId ,conversationId} = req.body || {};

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ message: "Messages are required" });
  }
  if (!mongoose.isValidObjectId(conversationId)) {
    return res.status(400).json({ message: "A valid conversationId is required" });
  }

  const conversation = await Conversation.findOne({ _id: conversationId, user: req.user._id });
  if (!conversation) {
    return res.status(404).json({ message: "Conversation not found" });
  }

  const lastMessage = messages[messages.length - 1];
  const question = lastMessage.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join(" ");

  let matches = [];
  try {
    matches = await searchChunks(req.user._id, question, documentId);
  } catch (error) {
    console.error("Search error:", error.message);
  }

  const sources = matches.map((match, i) => ({
    id: i + 1,
    title: match.title,
    page: match.page,
    text: match.chunk_text,
  }));

  const context = sources
    .map((s) => `[${s.id}] (${s.title}, page ${s.page})\n${s.text}`)
    .join("\n\n");

  const recentMessages = messages.slice(-10);

  pipeUIMessageStreamToResponse({
    response: res,
    stream: createUIMessageStream({
      originalMessages: messages,
      onFinish: async ({ messages: allMessages }) => {
        conversation.messages = allMessages;
        if (conversation.title === "New chat") {
          conversation.title = question.slice(0, 50);
        }
        await conversation.save();
      },
      execute: async ({ writer }) => {
        writer.write({ type: "start" });
        writer.write({ type: "data-sources", data: sources });

        const result = streamText({
          model: groq(process.env.GROQ_MODEL),
          system: buildChatPrompt(context),
          messages: await convertToModelMessages(recentMessages),
          maxOutputTokens: 1000,
          temperature: 0.2,
          providerOptions: {
            groq: { reasoningEffort: "low" },
          },
        });

        writer.merge(toUIMessageStream({ stream: result.stream, sendStart: false }));
      },
      onError: (error) => {
        console.error("Chat error:", error);
        return "Sorry, something went wrong while answering. Please try again.";
      },
    }),
  });
};
const partText = (message) =>
  message.parts.filter((p) => p.type === "text").map((p) => p.text).join("");

export const evaluateAnswer = async (req, res) => {
  const { conversationId, messageId } = req.body || {};

  if (!mongoose.isValidObjectId(conversationId)) {
    return res.status(400).json({ message: "A valid conversationId is required" });
  }

  const conversation = await Conversation.findOne({ _id: conversationId, user: req.user._id });
  if (!conversation) {
    return res.status(404).json({ message: "Conversation not found" });
  }

  const msgs = conversation.messages;
  let index = msgs.findIndex((m) => m.id === messageId && m.role === "assistant");
  if (index === -1) index = msgs.map((m) => m.role).lastIndexOf("assistant");
  if (index === -1) {
    return res.status(404).json({ message: "Answer not found" });
  }

  const message = msgs[index];
  const saved = conversation.evaluations?.[message.id];
  if (saved) {
    return res.json({ evaluation: saved });
  }

  const question = msgs.slice(0, index).reverse().find((m) => m.role === "user");
  const sources = message.parts.find((p) => p.type === "data-sources")?.data || [];

  let evaluation;
  if (sources.length === 0) {
    evaluation = {
      verdict: "fallback",
      score: null,
      reason: "No sources matched, so the app gave an honest fallback instead of answering.",
    };
  } else {
    try {
      const { output } = await generateText({
        model: groq(process.env.GROQ_MODEL),
        output: Output.object({ schema: evaluationSchema }),
        system: EVALUATOR_PROMPT,
        prompt: `Question:\n${question ? partText(question) : ""}\n\nSources:\n${sources
          .map((s) => `[${s.id}] (${s.title}, page ${s.page})\n${s.text}`)
          .join("\n\n")}\n\nAnswer to check:\n${partText(message)}`,
        temperature: 0,
        maxOutputTokens: 600,
        providerOptions: { groq: { reasoningEffort: "low" } },
      });
      evaluation = {
        verdict: output.verdict,
        score: Math.min(5, Math.max(1, Math.round(output.score))),
        reason: output.reason,
      };
    } catch (error) {
      console.error("Evaluation error:", error.message);
      return res.status(502).json({ message: "Could not check this answer. Please try again." });
    }
  }

  conversation.evaluations = { ...(conversation.evaluations || {}), [message.id]: evaluation };
  conversation.markModified("evaluations");
  await conversation.save();

  res.json({ evaluation });
};