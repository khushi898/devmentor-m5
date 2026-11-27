import { useState } from "react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";

function ShareQuizPanel({ quizId, initialPublic, initialShareId }) {
  const [isPublic, setIsPublic] = useState(Boolean(initialPublic));
  const [shareId, setShareId] = useState(initialShareId || null);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState("");

  const link = shareId ? `${window.location.origin}/shared/quiz/${shareId}` : "";

  const toggle = async (enabled) => {
    setBusy(true);
    setError("");
    setCopied(false);
    try {
      const res = await api.patch(`/quizzes/${quizId}/share`, { enabled });
      setIsPublic(res.data.isPublic);
      setShareId(res.data.shareId);
    } catch {
      setError("Could not change sharing. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
    } catch {
      setError("Copy failed. Select the link and copy it manually.");
    }
  };

  return (
    <div className="border rounded-lg p-3 space-y-2 text-sm">
      {isPublic ? (
        <>
          <p className="font-medium">Anyone with this link can take the quiz, no login needed:</p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              readOnly
              value={link}
              aria-label="Share link"
              onFocus={(e) => e.target.select()}
              className="flex-1 min-w-0 h-9 rounded-md border bg-background px-2 text-xs"
            />
            <Button size="sm" onClick={copy}>{copied ? "Copied!" : "Copy link"}</Button>
            <Button size="sm" variant="outline" disabled={busy} onClick={() => toggle(false)}>
              Stop sharing
            </Button>
          </div>
        </>
      ) : (
        <div className="flex items-center justify-between gap-2">
          <p className="text-muted-foreground">This quiz is private.</p>
          <Button size="sm" variant="outline" disabled={busy} onClick={() => toggle(true)}>
            {busy ? "Creating link..." : "Share quiz"}
          </Button>
        </div>
      )}
      {error && <p role="alert" className="text-destructive">{error}</p>}
    </div>
  );
}

export default ShareQuizPanel;