import { useState } from "react";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";

const todayString = () => new Date().toLocaleDateString("en-CA");
const isDue = (card) => !card.nextReview || card.nextReview <= todayString();

function FlashcardReview({ deck, onDeckChange }) {
  const [queue, setQueue] = useState(() => deck.cards.filter(isDue));
  const [flipped, setFlipped] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const card = queue[0];

  const mark = async (status) => {
    setSaving(true);
    setError("");
    try {
      const res = await api.patch(`/flashcards/${deck._id}/cards/${card._id}`, { status });
      onDeckChange(res.data.card);
      setQueue((prev) => (status === "known" ? prev.slice(1) : [...prev.slice(1), res.data.card]));
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
    const upcoming = deck.cards
      .map((c) => c.nextReview)
      .filter((d) => d && d > todayString())
      .sort()[0];

    return (
      <div className="border rounded-lg p-8 text-center space-y-3">
        <p className="text-lg font-semibold">🎉 All caught up for today!</p>
        {upcoming && (
          <p className="text-sm text-muted-foreground">
            Next review:{" "}
            {new Date(`${upcoming}T00:00:00`).toLocaleDateString("en-GB", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </p>
        )}
        <Button variant="outline" onClick={restart}>Review all cards anyway</Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        {queue.length} card(s) due for review · Box {card.box || 1} of 5
      </p>

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