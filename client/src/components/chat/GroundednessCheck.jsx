import { useState } from "react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";

const LABELS = {
  grounded: { text: "Grounded", style: "border-green-600 text-green-700" },
  partially_grounded: { text: "Partly grounded", style: "border-amber-500 text-amber-700" },
  not_grounded: { text: "Not grounded", style: "border-destructive text-destructive" },
  fallback: { text: "Honest fallback", style: "border-muted-foreground text-muted-foreground" },
};

function GroundednessCheck({ conversationId, messageId, initial }) {
  const [evaluation, setEvaluation] = useState(initial || null);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState("");

  const check = async () => {
    setChecking(true);
    setError("");
    try {
      const res = await api.post("/chat/evaluate", { conversationId, messageId });
      setEvaluation(res.data.evaluation);
    } catch (err) {
      setError(err.response?.data?.message || "Could not check this answer.");
    } finally {
      setChecking(false);
    }
  };

  if (evaluation) {
    const label = LABELS[evaluation.verdict] || LABELS.partially_grounded;
    return (
      <div className="mt-3 text-xs space-y-1">
        <span className={`inline-block rounded-full border px-2 py-0.5 font-medium ${label.style}`}>
          {label.text}
          {evaluation.score ? ` · ${evaluation.score}/5` : ""}
        </span>
        <p className="text-muted-foreground">{evaluation.reason}</p>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <Button variant="ghost" size="sm" onClick={check} disabled={checking}>
        {checking ? "Checking…" : "Check groundedness"}
      </Button>
      {error && <p role="alert" className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

export default GroundednessCheck;