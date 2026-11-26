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
