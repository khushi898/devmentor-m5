import { Pinecone } from "@pinecone-database/pinecone";

const MIN_SCORE = 0.25;
const RRF_K = 60;

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

const runSearch = async (index, scoreBy, topK, documentId) => {
  const options = {
    topK,
    scoreBy: [scoreBy],
    includeFields: ["chunk_text", "title", "page", "documentId"],
  };
  if (documentId) {
    options.filter = { documentId: { $eq: documentId.toString() } };
  }
  const results = await index.documents.search(options);
  return results.matches;
};

export const searchChunks = async (userId, query, documentId, { topK = 5, minScore = MIN_SCORE } = {}) => {
  const index = getIndex(userId);

  const [semantic, keyword] = await Promise.all([
    runSearch(index, { type: "embed", fields: ["chunk_text"], query }, topK * 2, documentId),
    runSearch(index, { type: "text", fields: ["chunk_text"], query }, topK * 2, documentId).catch((error) => {
      console.error("Keyword search failed, using semantic only:", error.message);
      return [];
    }),
  ]);

  const relevant = semantic.filter((match) => match._score >= minScore);
  if (relevant.length === 0) return [];

  const fused = new Map();
  const addRanks = (list) => {
    list.forEach((match, rank) => {
      const entry = fused.get(match._id) || { ...match, rrf: 0 };
      entry.rrf += 1 / (RRF_K + rank + 1);
      fused.set(match._id, entry);
    });
  };
  addRanks(relevant);
  addRanks(keyword);

  console.log(`Hybrid search: ${relevant.length} semantic + ${keyword.length} keyword matches`);

  return [...fused.values()].sort((a, b) => b.rrf - a.rrf).slice(0, topK);
};