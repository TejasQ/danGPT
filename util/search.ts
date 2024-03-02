import { AstraDB } from "@datastax/astra-db-ts";
import { text2vec } from "./text2vec";
import { collectionName } from "./collectionName";

export const search = async (query: string) => {
  console.time("search");
  console.timeLog("search", "Getting collection...");
  const astraClient = new AstraDB(
    process.env.ASTRA_DB_APPLICATION_TOKEN,
    process.env.ASTRA_DB_API_ENDPOINT
  );
  const collection = await astraClient.collection(collectionName);
  console.timeLog("search", "Vectorizing query", query, "...");
  const [$vector] = await text2vec([query]);
  console.timeLog("search", "Searching...");
  const results = (
    await collection
      .find({}, { sort: { $vector }, limit: 100, includeSimilarity: true })
      .toArray()
  ).filter((r) => r.$similarity > 0.7);
  console.timeLog("search", "Got results.", results);
  console.timeEnd("search");
  return results;
};
