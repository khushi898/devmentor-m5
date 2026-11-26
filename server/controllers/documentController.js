import Document from "../models/Document.js";
import { extractPages } from "../services/pdfService.js";
import { chunkPages } from "../services/chunkService.js";
import { saveChunks,deleteChunks } from "../services/vectorService.js";

export const uploadDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: "Please choose a PDF file" });
  }

  const isRealPdf = req.file.buffer.subarray(0, 4).toString() === "%PDF";
  if (!isRealPdf) {
    return res.status(400).json({ message: "This file is not a valid PDF" });
  }

  let totalPages;
  let pages;
  try {
    ({ totalPages, pages } = await extractPages(req.file.buffer));
  } catch (error) {
    return res.status(400).json({ message: "Could not read this PDF. It may be damaged." });
  }

  const chunks = chunkPages(pages);
  if (chunks.length === 0) {
    return res.status(400).json({ message: "No readable text found in this PDF. Scanned images are not supported." });
  }

  const title = req.body.title?.trim() || req.file.originalname.replace(/\.pdf$/i, "");

  const document = await Document.create({
    user: req.user._id,
    title,
    fileName: req.file.originalname,
    fileSize: req.file.size,
    pageCount: totalPages,
    chunkCount: chunks.length,
  });

  try {
    await saveChunks(req.user._id, document, chunks);
    document.status = "ready";
  } catch (error) {
    console.error("Pinecone error:", error.message);
    document.status = "failed";
  }
  await document.save();

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

  try {
    await deleteChunks(req.user._id, document._id);
  } catch (error) {
    console.error("Pinecone delete error:", error.message);
  }
  res.json({ message: "Document deleted" });
};