import { tool } from "ai";
import { z } from "zod";
import { createTask, listTasks, updateTask } from "../../services/taskService.js";
import { searchChunks } from "../../services/vectorService.js";

const safe = (name, fn) => async (input) => {
  try {
    return await fn(input);
  } catch (error) {
    console.error(`Tool ${name} failed:`, error.message);
    return { error: error.status ? error.message : "This action failed. Please try again." };
  }
};

const toPlain = (task) => ({
  id: task._id.toString(),
  title: task.title,
  dueDate: task.dueDate,
  status: task.status,
});

export const createStudyTools = (userId, today) => ({
  get_schedule: tool({
    description: "Read the user's study tasks. Optionally filter by a date range (YYYY-MM-DD) or by status.",
    inputSchema: z.object({
      from: z.string().optional().describe("Start date, YYYY-MM-DD"),
      to: z.string().optional().describe("End date, YYYY-MM-DD"),
      status: z.enum(["todo", "done"]).optional(),
    }),
    execute: safe("get_schedule", async (input) => {
      const tasks = await listTasks(userId, input);
      return { count: tasks.length, tasks: tasks.map(toPlain) };
    }),
  }),

  search_notes: tool({
    description: "Search the user's uploaded study documents to find which topics they cover.",
    inputSchema: z.object({
      topic: z.string().describe("The topic to look for, e.g. 'React hooks' or 'authentication'"),
    }),
    execute: safe("search_notes", async ({ topic }) => {
      const matches = await searchChunks(userId, topic, undefined, { topK: 6 });
      if (matches.length === 0) {
        return { found: false, message: "No material about this topic in the user's documents." };
      }
      return {
        found: true,
        results: matches.map((m) => ({ title: m.title, page: m.page, excerpt: m.chunk_text.slice(0, 300) })),
      };
    }),
  }),

  create_study_task: tool({
    description: "Create ONE study task on a specific date. Call it once for each task in a plan.",
    inputSchema: z.object({
      title: z.string().describe("Short task title, e.g. 'Revise useEffect and cleanup'"),
      dueDate: z.string().describe("Date, YYYY-MM-DD, today or later"),
      description: z.string().optional().describe("What to study and one practice task"),
    }),
    execute: safe("create_study_task", async (input) => {
      if (input.dueDate < today) {
        return { error: `The date ${input.dueDate} is in the past. Today is ${today}.` };
      }
      const task = await createTask(userId, { ...input, createdBy: "agent" });
      return { created: toPlain(task) };
    }),
  }),

  update_task: tool({
    description: "Change an existing task's title, due date or status. Use a task id from get_schedule.",
    inputSchema: z.object({
      taskId: z.string().describe("The task id from get_schedule"),
      title: z.string().optional(),
      dueDate: z.string().optional().describe("New date, YYYY-MM-DD"),
      status: z.enum(["todo", "done"]).optional(),
    }),
    execute: safe("update_task", async ({ taskId, ...updates }) => {
      const task = await updateTask(userId, taskId, updates);
      return { updated: toPlain(task) };
    }),
  }),
});