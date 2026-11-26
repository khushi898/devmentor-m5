import mongoose from "mongoose";

const cardSchema = new mongoose.Schema({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  page: { type: Number },
  status: { type: String, enum: ["new", "known", "unknown"], default: "new" },
});

const flashcardDeckSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    document: { type: mongoose.Schema.Types.ObjectId, ref: "Document", default: null },
    title: { type: String, required: true },
    topic: { type: String, default: "" },
    cards: [cardSchema],
  },
  { timestamps: true }
);

const FlashcardDeck = mongoose.model("FlashcardDeck", flashcardDeckSchema);

export default FlashcardDeck;