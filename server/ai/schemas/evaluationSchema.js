import { z } from "zod";

export const evaluationSchema=z.object({
    score: z.number().describe("1 = not supported at all, 5 = every claim is supported by the sources"),
    verdict: z.enum(["grounded","partially-grounded","not_grounded"]),
    reason: z.string().describe("One short sentence explaining the score"),
});