import { z } from "zod";

export const quizSchema=z.object({
    questions: z.array(
        z.object({
            question: z.string().describe("A multiple-choice question testing one concept from the material"),
            options: z.array(z.string()).describe("Exactly 4 answer options"),
            correctIndex: z.number().describe("Index (0-3) of the correct option"),
            explanation: z.string().describe("Why the correct answer is right, based on the material"),
            page: z.number().describe("Page number where the answer is found"),
        })
    ),
});