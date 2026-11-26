import { Pinecone } from "@pinecone-database/pinecone";
const MIN_SCORE=0.25;

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
export const searchChunks = async (userId, query, documentId, { topK = 5, minScore = MIN_SCORE } = {}) => {
  const index = getIndex(userId);

  const options = {
    topK,
    scoreBy: [{ type: "embed", fields: ["chunk_text"], query }],
    includeFields: ["chunk_text", "title", "page", "documentId"],
  };

  if (documentId) {
    options.filter = { documentId: { $eq: documentId.toString() } };
  }

  const results = await index.documents.search(options);
  return results.matches.filter((match) => match._score >= minScore);
};