import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ToolCallCard from "./ToolCallCard";

const SUGGESTIONS = [
  "I have 5 days before my React interview, plan my revision",
  "What's on my study schedule this week?",
  "Move my JWT task to tomorrow",
];

function StudyPlanner({ onTasksChanged }) {
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  const { messages, sendMessage, status, error } = useChat({
    transport: new DefaultChatTransport({
      api: `${import.meta.env.VITE_API_URL}/agent`,
      headers: () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` }),
    }),
  });

  const busy = status === "submitted" || status === "streaming";

  const changedCount = messages
    .flatMap((m) => m.parts)
    .filter((p) => (p.type === "tool-create_study_task" || p.type === "tool-update_task") && p.state === "output-available")
    .length;

  useEffect(() => {
    if (changedCount > 0) onTasksChanged();
  }, [changedCount, onTasksChanged]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [messages]);

  const send = (text) => {
    if (!text.trim() || busy) return;
    sendMessage({ text });
    setInput("");
  };

  return (
    <div className="border rounded-lg flex flex-col">
      <div className="max-h-[28rem] overflow-y-auto p-4 space-y-4" aria-live="polite">
        {messages.length === 0 && (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Ask the study planner to organise your revision. Try:</p>
            {SUGGESTIONS.map((s) => (
              <button key={s} type="button" onClick={() => send(s)} className="block w-full text-left text-sm border rounded-md p-2 hover:bg-muted">
                {s}
              </button>
            ))}
          </div>
        )}

        {messages.map((message) => (
          <div key={message.id} className={message.role === "user" ? "flex justify-end" : "space-y-2"}>
            {message.role === "user" ? (
              <p className="max-w-[85%] rounded-lg px-3 py-2 bg-primary text-primary-foreground text-sm">
                {message.parts.filter((p) => p.type === "text").map((p) => p.text).join("")}
              </p>
            ) : (
              message.parts.map((part, i) => {
                if (part.type === "text") {
                  return (
                    <div key={i} className="prose prose-sm max-w-none min-w-0">
                      <ReactMarkdown>{part.text}</ReactMarkdown>
                    </div>
                  );
                }
                if (part.type.startsWith("tool-")) {
                  return <ToolCallCard key={part.toolCallId || i} part={part} />;
                }
                return null;
              })
            )}
          </div>
        ))}

        {status === "submitted" && <p className="text-sm text-muted-foreground">Planning…</p>}
        {error && <p role="alert" className="text-sm text-destructive">Something went wrong. Please try again.</p>}
        <div ref={bottomRef} />
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="border-t p-3 flex gap-2"
      >
        <Input value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. Plan my next 7 days" aria-label="Message the study planner" disabled={busy} />
        <Button type="submit" disabled={busy || !input.trim()}>{busy ? "Working…" : "Send"}</Button>
      </form>
    </div>
  );
}

export default StudyPlanner;