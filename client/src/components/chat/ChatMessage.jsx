import ReactMarkdown from "react-markdown";
import SourceList from "./SourceList";
import GroundednessCheck from "./GroundednessCheck.jsx";

function ChatMessage({ message,conversationId,evaluation,canCheck }) {
  const isUser = message.role === "user";

  const text = message.parts
    .filter((part) => part.type === "text")
    .map((part) => part.text)
    .join("");

  const sourcesPart = message.parts.find((part) => part.type === "data-sources");
  const allSources = sourcesPart?.data || [];
  const isCited = (id) => new RegExp(`[\\[【]\\s*${id}\\s*[\\]】]`).test(text);
  const sources = allSources.filter((source) => isCited(source.id));

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
        {!isUser && canCheck && (
          <GroundednessCheck conversationId={conversationId} messageId={message.id} initial={evaluation} />
        )}
      </div>
    </div>
  );
}

export default ChatMessage;