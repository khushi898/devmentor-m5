import { useState } from "react";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

function TaskItem({ task, onUpdate, onDelete }) {
  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState(task.title);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const done = task.status === "done";

  const run = async (action) => {
    setBusy(true);
    setError("");
    try {
      await action();
    } catch (err) {
      setError(err.response?.data?.message || "Could not save the change. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const saveTitle = () =>
    run(async () => {
      await onUpdate(task._id, { title });
      setEditing(false);
    });

  return (
    <li className="border rounded-lg p-3 space-y-2">
      <div className="flex items-center gap-3">
        <input
          type="checkbox"
          checked={done}
          disabled={busy}
          onChange={(e) => run(() => onUpdate(task._id, { status: e.target.checked ? "done" : "todo" }))}
          aria-label={`Mark "${task.title}" as ${done ? "not done" : "done"}`}
          className="h-4 w-4 shrink-0"
        />
        {editing ? (
          <Input value={title} onChange={(e) => setTitle(e.target.value)} aria-label="Task title" className="h-8 flex-1" />
        ) : (
          <span className={`flex-1 min-w-0 break-words ${done ? "line-through text-muted-foreground" : ""}`}>
            {task.title}
          </span>
        )}
        {task.createdBy === "agent" && <Badge variant="secondary">AI</Badge>}
      </div>

      {task.description && <p className="text-sm text-muted-foreground pl-7">{task.description}</p>}

      <div className="flex flex-wrap items-center gap-2 pl-7">
        <input
          type="date"
          value={task.dueDate}
          disabled={busy}
          onChange={(e) => e.target.value && run(() => onUpdate(task._id, { dueDate: e.target.value }))}
          aria-label={`Due date for "${task.title}"`}
          className="h-8 rounded-md border bg-background px-2 text-sm"
        />
        {editing ? (
          <>
            <Button size="sm" onClick={saveTitle} disabled={busy}>Save</Button>
            <Button size="sm" variant="ghost" onClick={() => { setTitle(task.title); setEditing(false); }}>Cancel</Button>
          </>
        ) : (
          <Button size="sm" variant="ghost" onClick={() => setEditing(true)}>Edit</Button>
        )}
        <Button
          size="sm"
          variant="ghost"
          disabled={busy}
          aria-label={`Delete "${task.title}"`}
          onClick={() => window.confirm("Delete this task?") && run(() => onDelete(task._id))}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>

      {error && <p role="alert" className="text-sm text-destructive pl-7">{error}</p>}
    </li>
  );
}

export default TaskItem;