import { Wrench } from "lucide-react";

const RUNNING_TEXT = {
  get_schedule: "Checking your schedule…",
  search_notes: "Reading your notes…",
  create_study_task: "Creating a task…",
  update_task: "Updating a task…",
};

function ToolCallCard({ part }) {
  const name = part.type.replace("tool-", "");
  const running = part.state === "input-streaming" || part.state === "input-available";
  const failed = part.state === "output-error" || Boolean(part.output?.error);
  const errorMessage = part.errorText || part.output?.error;

  return (
    <div className={`rounded-md border p-2 text-xs space-y-1 min-w-0 ${failed ? "border-destructive bg-red-50" : "bg-background"}`}>
      <div className="flex items-center gap-2">
        <Wrench className="h-3 w-3 shrink-0" />
        <span className="font-mono font-semibold">{name}</span>
        <span className={failed ? "text-destructive" : "text-muted-foreground"}>
          {running ? RUNNING_TEXT[name] || "Running…" : failed ? "failed" : "done"}
        </span>
      </div>

      {part.input && (
        <p className="font-mono break-all text-muted-foreground">
          {JSON.stringify(part.input)}
        </p>
      )}

      {failed && <p className="text-destructive">{errorMessage}</p>}

      {part.state === "output-available" && !failed && (
        <details>
          <summary className="cursor-pointer text-muted-foreground">Result</summary>
          <pre className="mt-1 overflow-x-auto">{JSON.stringify(part.output, null, 2)}</pre>
        </details>
      )}
    </div>
  );
}

export default ToolCallCard;