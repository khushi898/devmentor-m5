import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { MessageSquare, Trash2 } from "lucide-react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

function ChatList({ documents }) {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [scope, setScope] = useState("");
  const [creating, setCreating] = useState(false);

  const readyDocs = documents.filter((doc) => doc.status === "ready");

  useEffect(() => {
    api
      .get("/conversations")
      .then((res) => setConversations(res.data.conversations))
      .catch(() => setError("Could not load your chats."))
      .finally(() => setLoading(false));
  }, []);

  const startChat = async () => {
    setCreating(true);
    try {
      const res = await api.post("/conversations", { documentId: scope || null });
      navigate(`/chat/${res.data.conversation._id}`);
    } catch {
      setError("Could not start a new chat. Please try again.");
      setCreating(false);
    }
  };

  const deleteChat = async (id) => {
    if (!window.confirm("Delete this chat?")) return;
    try {
      await api.delete(`/conversations/${id}`);
      setConversations((prev) => prev.filter((c) => c._id !== id));
    } catch {
      setError("Could not delete the chat.");
    }
  };

  const docTitle = (id) => documents.find((d) => d._id === id)?.title || "a document";

  return (
    <div className="space-y-4">
      <div className="border rounded-lg p-4 flex flex-col sm:flex-row sm:items-end gap-3">
        <div className="flex-1 space-y-2">
          <Label htmlFor="scope">Chat with</Label>
          <select
            id="scope"
            value={scope}
            onChange={(e) => setScope(e.target.value)}
            className="w-full h-9 rounded-md border bg-background px-3 text-sm"
          >
            <option value="">All my documents</option>
            {readyDocs.map((doc) => (
              <option key={doc._id} value={doc._id}>{doc.title}</option>
            ))}
          </select>
        </div>
        <Button onClick={startChat} disabled={creating || readyDocs.length === 0}>
          {creating ? "Starting..." : "New chat"}
        </Button>
      </div>

      {readyDocs.length === 0 && (
        <p className="text-sm text-muted-foreground">Upload a PDF first to start chatting.</p>
      )}

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

      {loading ? (
        <div className="space-y-2">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
        </div>
      ) : conversations.length === 0 ? (
        <p className="text-sm text-muted-foreground">No chats yet.</p>
      ) : (
        <ul className="space-y-2">
          {conversations.map((c) => (
            <li key={c._id} className="flex items-center justify-between gap-2 border rounded-lg p-3">
              <Link to={`/chat/${c._id}`} className="flex items-center gap-3 min-w-0 flex-1">
                <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="min-w-0">
                  <p className="font-medium truncate">{c.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {c.documentId ? `Only: ${docTitle(c.documentId)}` : "All documents"}
                  </p>
                </div>
              </Link>
              <Button variant="ghost" size="icon" aria-label={`Delete chat ${c.title}`} onClick={() => deleteChat(c._id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default ChatList;