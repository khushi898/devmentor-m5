import { useEffect, useState } from "react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import TaskItem from "./TaskItem";

const todayString = () => new Date().toLocaleDateString("en-CA");
const byDate = (a, b) => a.dueDate.localeCompare(b.dueDate);

const formatDay = (date) => {
  if (date === todayString()) return "Today";
  return new Date(`${date}T00:00:00`).toLocaleDateString("en-GB", { weekday: "short", day: "numeric", month: "short" });
};

function TaskBoard({ refreshKey = 0 }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [title, setTitle] = useState("");
  const [dueDate, setDueDate] = useState(todayString());
  const [formError, setFormError] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    api
      .get("/tasks")
      .then((res) => {
        setTasks(res.data.tasks);
        setError("");
      })
      .catch(() => setError("Could not load your study tasks."))
      .finally(() => setLoading(false));
  }, [refreshKey]);

  const handleAdd = async (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setFormError("Give the task a title");
      return;
    }
    setAdding(true);
    setFormError("");
    try {
      const res = await api.post("/tasks", { title, dueDate });
      setTasks((prev) => [...prev, res.data.task].sort(byDate));
      setTitle("");
    } catch (err) {
      setFormError(err.response?.data?.message || "Could not add the task.");
    } finally {
      setAdding(false);
    }
  };

  const handleUpdate = async (id, updates) => {
    const res = await api.patch(`/tasks/${id}`, updates);
    setTasks((prev) => prev.map((t) => (t._id === id ? res.data.task : t)).sort(byDate));
  };

  const handleDelete = async (id) => {
    await api.delete(`/tasks/${id}`);
    setTasks((prev) => prev.filter((t) => t._id !== id));
  };

  const groups = tasks.reduce((acc, task) => {
    (acc[task.dueDate] ||= []).push(task);
    return acc;
  }, {});

  const doneCount = tasks.filter((t) => t.status === "done").length;

  return (
    <div className="space-y-4">
      <form onSubmit={handleAdd} className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex-1 space-y-2">
          <Label htmlFor="task-title">New study task</Label>
          <Input id="task-title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Revise JWT authentication" />
        </div>
        <div className="space-y-2">
          <Label htmlFor="task-date">Due</Label>
          <input
            id="task-date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="h-9 w-full rounded-md border bg-background px-3 text-sm"
          />
        </div>
        <Button type="submit" disabled={adding}>{adding ? "Adding..." : "Add task"}</Button>
      </form>
      {formError && <p role="alert" className="text-sm text-destructive">{formError}</p>}

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      ) : error ? (
        <p role="alert" className="text-sm text-destructive">{error}</p>
      ) : tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">No study tasks yet. Add one above, or ask the study planner to make a plan for you.</p>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">{doneCount} of {tasks.length} tasks done</p>
          {Object.entries(groups).map(([date, dayTasks]) => (
            <div key={date} className="space-y-2">
              <h3 className="text-sm font-semibold">{formatDay(date)}</h3>
              <ul className="space-y-2">
                {dayTasks.map((task) => (
                  <TaskItem key={task._id} task={task} onUpdate={handleUpdate} onDelete={handleDelete} />
                ))}
              </ul>
            </div>
          ))}
        </>
      )}
    </div>
  );
}

export default TaskBoard;