import {
  convertToModelMessages,
  createUIMessageStream,
  pipeUIMessageStreamToResponse,
  streamText,
  toUIMessageStream,
} from "ai";
import { groq } from "@ai-sdk/groq";
import { createStudyTools } from "../ai/tools/studyTools.js";
import { buildAgentPrompt } from "../ai/prompts/agentPrompt.js";

const getToday = () => {
  const now = new Date();
  return {
    today: now.toLocaleDateString("en-CA", { timeZone: "Europe/London" }),
    weekday: now.toLocaleDateString("en-GB", { weekday: "long", timeZone: "Europe/London" }),
  };
};

export const agentChat = async (req, res) => {
  const { messages } = req.body || {};
  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ message: "Messages are required" });
  }

  const { today, weekday } = getToday();

  pipeUIMessageStreamToResponse({
    response: res,
    stream: createUIMessageStream({
      execute: async ({ writer }) => {
        const result = streamText({
          model: groq(process.env.GROQ_MODEL),
          system: buildAgentPrompt(today, weekday),
          messages: await convertToModelMessages(messages.slice(-12)),
          tools: createStudyTools(req.user._id, today),
          stopWhen: ({ steps }) => steps.length >= 10,
          temperature: 0.2,
          maxOutputTokens: 2000,
          providerOptions: { groq: { reasoningEffort: "low" } },
        });
        writer.merge(toUIMessageStream({ stream: result.stream }));
      },
      onError: (error) => {
        console.error("Agent error:", error);
        return "Sorry, the study planner had a problem. Please try again.";
      },
    }),
  });
};