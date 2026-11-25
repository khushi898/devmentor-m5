import Document from "../models/Document.js";

export const uploadDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Please choose a PDF file" });
  }

  const isRealPdf = req.file.buffer.subarray(0, 4).toString() === "%PDF";
  if (!isRealPdf) {
    return res.status(400).json({ message: "This file is not a valid PDF" });
  }

  const title = req.body.title?.trim() || req.file.originalname.replace(/\.pdf$/i, "");

  const document = await Document.create({
    user: req.user._id,
    title,
    fileName: req.file.originalname,
    fileSize: req.file.size,
  });

  res.status(201).json({ document });
};

export const getDocuments = async (req, res) => {
  const documents = await Document.find({ user: req.user._id }).sort({ createdAt: -1 });
  res.json({ documents });
};

export const deleteDocument = async (req, res) => {
  const document = await Document.findOneAndDelete({ _id: req.params.id, user: req.user._id });
  if (!document) {
    return res.status(404).json({ message: "Document not found" });
  }
  res.json({ message: "Document deleted" });
};