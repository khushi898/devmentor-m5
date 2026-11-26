import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ChatMessage from "./ChatMessage";

function ChatWindow({ conversation }) {
  const [input, setInput] = useState("");
  const bottomRef = useRef(null);

  const { messages, sendMessage, status, error } = useChat({
    id: conversation._id,
    messages: conversation.messages,
    transport: new DefaultChatTransport({
      api: `${import.meta.env.VITE_API_URL}/chat`,
      headers: () => ({ Authorization: `Bearer ${localStorage.getItem("token")}` }),
      body: { conversationId: conversation._id, documentId: conversation.documentId },
    }),
  });

  const isBusy = status === "submitted" || status === "streaming";

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!input.trim() || isBusy) return;
    sendMessage({ text: input });
    setInput("");
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex-1 overflow-y-auto space-y-4 p-4" aria-live="polite">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground mt-10">
            <p className="font-medium">Ask anything about your documents</p>
            <p className="text-sm">e.g. "What does the dependency array in useEffect do?"</p>
          </div>
        )}

        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}

        {status === "submitted" && (
          <p className="text-sm text-muted-foreground">Searching your notes...</p>
        )}

        {error && (
          <p role="alert" className="text-sm text-destructive">
            Something went wrong. Please try again.
          </p>
        )}

        <div ref={bottomRef} />
      </div>

      <form onSubmit={handleSubmit} className="border-t p-4 flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about your documents..."
          aria-label="Your question"
          disabled={isBusy}
        />
        <Button type="submit" disabled={isBusy || !input.trim()}>
          {isBusy ? "Thinking..." : "Send"}
        </Button>
      </form>
    </div>
  );
}

export default ChatWindow;