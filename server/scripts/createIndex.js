import "dotenv/config";
import { Pinecone } from "@pinecone-database/pinecone";

const pc = new Pinecone({ apiKey: process.env.PINECONE_API_KEY });

await pc.indexes.create({
  name: process.env.PINECONE_INDEX,
  schema: {
    fields: {
      chunk_text: { type: "string", fullTextSearch: { language: "en" }, embed: {} },
    },
  },
  waitUntilReady: true,
  suppressConflicts: true,
});

console.log("Pinecone index is ready");