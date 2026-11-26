import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

function GeneratorForm({ documents, endpoint, getPath, idPrefix, buttonText, loadingText }) {
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
      const res = await api.post(endpoint, { documentId: documentId || undefined, topic });
      navigate(getPath(res.data));
    } catch (err) {
      setError(err.response?.data?.message || "Something went wrong. Please try again.");
      setGenerating(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="border rounded-lg p-4 space-y-4">
      <div className="space-y-2">
        <Label htmlFor={`${idPrefix}-doc`}>From document</Label>
        <select
          id={`${idPrefix}-doc`}
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
        <Label htmlFor={`${idPrefix}-topic`}>Topic (optional)</Label>
        <Input id={`${idPrefix}-topic`} value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. useEffect, JWT, indexes" />
      </div>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <Button type="submit" disabled={generating || readyDocs.length === 0}>
        {generating ? loadingText : buttonText}
      </Button>
    </form>
  );
}

export default GeneratorForm;