import { z } from "zod";

export const flashcardSetSchema=z.object({
    flashcards: z.array(
        z.object({
            question:z.string().describe("A clear question that tests one concept from the material"),
            answer: z.string().describe("A short, accurate answer taken from the material"),
            page: z.number().describe("The page number where the answer is found"),
        })
    ),
    
});