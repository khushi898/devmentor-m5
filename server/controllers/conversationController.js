import Conversation from "../models/Conversation.js";

export const createConversation = async (req, res) => {
  const conversation = await Conversation.create({
    user: req.user._id,
    documentId: req.body?.documentId || null,
  });
  res.status(201).json({ conversation });
};

export const getConversations = async (req, res) => {
  const conversations = await Conversation.find({ user: req.user._id })
    .select("title documentId updatedAt")
    .sort({ updatedAt: -1 });
  res.json({ conversations });
};

export const getConversation = async (req, res) => {
  const conversation = await Conversation.findOne({ _id: req.params.id, user: req.user._id });
  if (!conversation) {
    return res.status(404).json({ message: "Conversation not found" });
  }
  res.json({ conversation });
};

export const deleteConversation = async (req, res) => {
  const conversation = await Conversation.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!conversation) {
    return res.status(404).json({ message: "Conversation not found" });
  }
  res.json({ message: "Conversation deleted" });
};