import mongoose from "mongoose";

const conversationSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true, index: true },
    title: { type: String, default: "New chat" },
    documentId: { type: mongoose.Schema.Types.ObjectId, ref: "Document", default: null },
    messages: { type: Array, default: [] },
    evaluations:{type:mongoose.Schema.Types.Mixed, default:{}},
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", conversationSchema);

export default Conversation;