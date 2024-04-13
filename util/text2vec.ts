import OpenAI from "openai";

export const text2vec = async (texts: string[]) => {
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  const embedding = await openai.embeddings.create({
    model: "text-embedding-3-small",
    dimensions: 1024,
    input: texts,
  });

  return embedding.data.map((d) => d.embedding);
};
