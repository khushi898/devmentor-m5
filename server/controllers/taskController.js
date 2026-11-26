import { createTask, listTasks, updateTask, deleteTask } from "../services/taskService.js";

export const getTasks = async (req, res) => {
  const tasks = await listTasks(req.user._id, req.query);
  res.json({ tasks });
};

export const addTask = async (req, res) => {
  const task = await createTask(req.user._id, { ...req.body, createdBy: "user" });
  res.status(201).json({ task });
};

export const editTask = async (req, res) => {
  const task = await updateTask(req.user._id, req.params.id, req.body || {});
  res.json({ task });
};

export const removeTask = async (req, res) => {
  await deleteTask(req.user._id, req.params.id);
  res.json({ message: "Task deleted" });
};