import { Pinecone } from "@pinecone-database/pinecone";

const getIndex = (userId) => {
  const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });
  return pc.index({ name: process.env.PINECONE_INDEX, namespace: userId.toString() });
};

export const saveChunks = async (userId, document, chunks) => {
  const index = getIndex(userId);

  const records = chunks.map((chunk, i) => ({
    _id: `${document._id}-${i}`,
    chunk_text: chunk.text,
    documentId: document._id.toString(),
    title: document.title,
    page: chunk.page,
  }));

  for (let i = 0; i < records.length; i += 90) {
    await index.documents.upsert({ documents: records.slice(i, i + 90) });
  }
};

export const deleteChunks = async (userId, documentId) => {
  const index = getIndex(userId);
  await index.documents.delete({ filter: { documentId: { $eq: documentId.toString() } } });
};