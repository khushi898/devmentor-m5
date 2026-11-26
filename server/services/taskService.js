import mongoose from "mongoose";
import StudyTask from "../models/StudyTask.js";

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const fail = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  throw error;
};

const checkDate = (date) => {
  if (!DATE_RE.test(date || "") || isNaN(new Date(date).getTime())) {
    fail("dueDate must be a real date in YYYY-MM-DD format");
  }
};

export const createTask = async (userId, { title, description = "", dueDate, createdBy = "user" }) => {
  if (!title?.trim()) fail("Title is required");
  checkDate(dueDate);
  return StudyTask.create({ user: userId, title: title.trim(), description, dueDate, createdBy });
};

export const listTasks = async (userId, { from, to, status } = {}) => {
  const filter = { user: userId };
  if (from || to) {
    filter.dueDate = {};
    if (from) filter.dueDate.$gte = from;
    if (to) filter.dueDate.$lte = to;
  }
  if (status) filter.status = status;
  return StudyTask.find(filter).sort({ dueDate: 1, createdAt: 1 });
};

export const updateTask = async (userId, taskId, updates = {}) => {
  if (!mongoose.isValidObjectId(taskId)) fail("Task not found", 404);

  const task = await StudyTask.findOne({ _id: taskId, user: userId });
  if (!task) fail("Task not found", 404);

  if (updates.title !== undefined) {
    if (!updates.title.trim()) fail("Title cannot be empty");
    task.title = updates.title.trim();
  }
  if (updates.description !== undefined) task.description = updates.description;
  if (updates.dueDate !== undefined) {
    checkDate(updates.dueDate);
    task.dueDate = updates.dueDate;
  }
  if (updates.status !== undefined) {
    if (!["todo", "done"].includes(updates.status)) fail("Status must be todo or done");
    task.status = updates.status;
  }

  return task.save();
};

export const deleteTask = async (userId, taskId) => {
  if (!mongoose.isValidObjectId(taskId)) fail("Task not found", 404);
  const task = await StudyTask.findOneAndDelete({ _id: taskId, user: userId });
  if (!task) fail("Task not found", 404);
  return task;
};