import ReactMarkdown from "react-markdown";
import SourceList from "./SourceList";

function ChatMessage({ message }) {
  const isUser = message.role === "user";

  const text = message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");

  const sourcesPart = message.parts.find((part) => part.type === "data-sources");
  const allSources = sourcesPart?.data || [];
  const sources = allSources.filter((source) => text.includes(`[${source.id}]`));

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[85%] rounded-lg px-4 py-3 ${
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        }`}
      >
        {isUser ? (
          <p className="whitespace-pre-wrap">{text}</p>
        ) : (
          <div className="prose prose-sm max-w-none">
            <ReactMarkdown>{text}</ReactMarkdown>
          </div>
        )}

        {!isUser && sources.length > 0 && <SourceList sources={sources} />}
      </div>
    </div>
  );
}

export default ChatMessage;