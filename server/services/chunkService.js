const CHUNK_SIZE = 1000;
const CHUNK_OVERLAP = 200;

export const chunkPages = (pages) => {
  const chunks = [];

  pages.forEach((pageText, index) => {
    const text = pageText.replace(/\s+/g, " ").trim();
    let start = 0;

    while (start < text.length) {
      const end = start + CHUNK_SIZE;
      chunks.push({ text: text.slice(start, end), page: index + 1 });
      if (end >= text.length) break;
      start = end - CHUNK_OVERLAP;
    }
  });

  return chunks;
};