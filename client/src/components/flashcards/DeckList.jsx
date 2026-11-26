import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Layers } from "lucide-react";
import api from "@/api/axios";
import { Skeleton } from "@/components/ui/skeleton";

function DeckList() {
  const [decks, setDecks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get("/flashcards")
      .then((res) => setDecks(res.data.decks))
      .catch(() => setError("Could not load your flashcard decks."))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-14 w-full" />
        <Skeleton className="h-14 w-full" />
      </div>
    );
  }

  if (error) return <p role="alert" className="text-sm text-destructive">{error}</p>;

  if (decks.length === 0) {
    return <p className="text-sm text-muted-foreground">No flashcard decks yet. Generate your first one above.</p>;
  }

  return (
    <ul className="space-y-2">
      {decks.map((deck) => {
        const known = deck.cards.filter((c) => c.status === "known").length;
        return (
          <li key={deck._id}>
            <Link to={`/flashcards/${deck._id}`} className="flex items-center justify-between gap-3 border rounded-lg p-3 hover:bg-muted">
              <div className="flex items-center gap-3 min-w-0">
                <Layers className="h-4 w-4 shrink-0 text-muted-foreground" />
                <p className="font-medium truncate">{deck.title}</p>
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {known}/{deck.cards.length} known
              </span>
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export default DeckList;