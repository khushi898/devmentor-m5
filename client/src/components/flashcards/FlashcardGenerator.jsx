import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function FlashcardGenerator({ documents }) {
  const navigate = useNavigate();
  const [documentId, setDocumentId] = useState("");
  const [topic, setTopic] = useState("");
  const [error, setError] = useState("");
  const [generating, setGenerating] = useState(false);

  const readyDocs = documents.filter((doc) => doc.status === "ready");

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!documentId && !topic.trim()) {
      setError("Choose a document or type a topic");
      return;
    }
    setGenerating(true);
    setError("");
    try {
      const res = await api.post("/flashcards/generate", { documentId: documentId || undefined, topic });
      navigate(`/flashcards/${res.data.deck._id}`);
    } catch (err) {
      setError(err.response?.data?.message || "Could not generate flashcards. Please try again.");
      setGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-4">
      <div className="space-y-2">
        <Label htmlFor="fc-doc">From document</Label>
        <select
          id="fc-doc"
          value={documentId}
          onChange={(e) => setDocumentId(e.target.value)}
          className="w-full h-9 rounded-md border bg-background px-3 text-sm"
        >
          <option value="">Any document (use topic)</option>
          {readyDocs.map((doc) => (
            <option key={doc._id} value={doc._id}>{doc.title}</option>
          ))}
        </select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="fc-topic">Topic (optional)</Label>
        <Input id="fc-topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. useEffect, JWT, indexes" />
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={generating || readyDocs.length === 0}>
        {generating ? "Generating flashcards..." : "Generate flashcards"}
      </Button>
    </form>
  );
}

export default FlashcardGenerator;