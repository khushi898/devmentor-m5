import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import FlashcardReview from "@/components/flashcards/FlashcardReview";

function FlashcardsPage() {
  const { id } = useParams();
  const [deck, setDeck] = useState(null);
  const [error, setError] = useState("");
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    api
      .get(`/flashcards/${id}`)
      .then((res) => setDeck(res.data.deck))
      .catch(() => setError("This deck could not be found."));
  }, [id]);

  const handleDeckChange = (cardId, status) => {
    setDeck((prev) => ({
      ...prev,
      cards: prev.cards.map((c) => (c._id === cardId ? { ...c, status } : c)),
    }));
  };

  const known = deck ? deck.cards.filter((c) => c.status === "known").length : 0;

  return (
    <div className="min-h-screen p-4 md:p-8 max-w-2xl mx-auto space-y-6">
      <Link to="/dashboard?tab=flashcards" className="text-sm underline">← Dashboard</Link>

      {error && <p role="alert" className="text-destructive">{error}</p>}

      {!deck && !error && (
        <div className="space-y-3">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-56 w-full" />
        </div>
      )}

      {deck && (
        <>
          <div>
            <h1 className="text-2xl font-bold">{deck.title}</h1>
            <p className="text-sm text-muted-foreground">{known} of {deck.cards.length} cards known</p>
          </div>

          <FlashcardReview deck={deck} onDeckChange={handleDeckChange} />

          <div>
            <Button variant="ghost" size="sm" onClick={() => setShowRaw((s) => !s)}>
              {showRaw ? "Hide raw JSON" : "View raw JSON"}
            </Button>
            {showRaw && (
              <pre className="mt-2 p-4 rounded-lg bg-muted text-xs overflow-x-auto">
                {JSON.stringify(deck.cards.map(({ question, answer, page }) => ({ question, answer, page })), null, 2)}
              </pre>
            )}
          </div>
        </>
      )}
    </div>
  );
}

export default FlashcardsPage;