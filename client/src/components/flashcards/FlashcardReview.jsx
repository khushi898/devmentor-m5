import { useState } from "react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";

function FlashcardReview({ deck, onDeckChange }) {
  const [queue, setQueue] = useState(() => deck.cards.filter((c) => c.status !== "known"));
  const [flipped, setFlipped] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const card = queue[0];

  const mark = async (status) => {
    setSaving(true);
    setError("");
    try {
      await api.patch(`/flashcards/${deck._id}/cards/${card._id}`, { status });
      onDeckChange(card._id, status);
      setQueue((prev) => (status === "known" ? prev.slice(1) : [...prev.slice(1), prev[0]]));
      setFlipped(false);
    } catch {
      setError("Could not save your answer. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const restart = () => {
    setQueue(deck.cards);
    setFlipped(false);
  };

  if (!card) {
    return (
      <div className="border rounded-lg p-8 text-center space-y-3">
        <p className="text-lg font-semibold">🎉 You know every card in this deck!</p>
        <Button variant="outline" onClick={restart}>Review all cards again</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">{queue.length} card(s) left in your review queue</p>

      <button
        type="button"
        onClick={() => setFlipped((f) => !f)}
        aria-label={flipped ? "Show question" : "Show answer"}
        className="w-full min-h-56 border rounded-lg p-6 text-left bg-muted hover:bg-muted/70 transition-colors"
      >
        <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
          {flipped ? "Answer" : "Question"} · page {card.page}
        </p>
        <p className="text-lg">{flipped ? card.answer : card.question}</p>
        {!flipped && <p className="text-sm text-muted-foreground mt-4">Tap the card to see the answer</p>}
      </button>

      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

      {flipped && (
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" disabled={saving} onClick={() => mark("unknown")}>
            Still learning
          </Button>
          <Button className="flex-1" disabled={saving} onClick={() => mark("known")}>
            I knew it
          </Button>
        </div>
      )}
    </div>
  );
}

export default FlashcardReview;