import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "@/api/axios";
import { Skeleton } from "@/components/ui/skeleton";
import ChatWindow from "@/components/chat/ChatWindow";

function ChatPage() {
  const { id } = useParams();
  const [conversation, setConversation] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/conversations/${id}`)
      .then((res) => setConversation(res.data.conversation))
      .catch(() => setError("This conversation could not be found."));
  }, [id]);

  return (
    <div className="h-screen flex flex-col max-w-3xl mx-auto">
      <header className="flex items-center justify-between gap-4 border-b p-4">
        <Link to="/dashboard" className="text-sm underline shrink-0">← Dashboard</Link>
        <h1 className="font-semibold truncate">{conversation?.title || "Chat"}</h1>
      </header>

      {error && <p role="alert" className="p-4 text-destructive">{error}</p>}

      {!conversation && !error && (
        <div className="p-4 space-y-3">
          <Skeleton className="h-16 w-1/2 ml-auto" />
          <Skeleton className="h-24 w-3/4" />
        </div>
      )}

      {conversation && <ChatWindow conversation={conversation} />}
    </div>
  );
}

export default ChatPage;