import { DataAPIClient } from "@datastax/astra-db-ts";
import dotenv from "dotenv";
import { text2vec } from "./text2vec";
import { collectionName } from "./collectionName";

dotenv.config();

export const search = async (query: string) => {
  if (!process.env.ASTRA_DB_APPLICATION_TOKEN) {
    throw new Error("Please provide an ASTRA_DB_APPLICATION_TOKEN");
  }

  if (!process.env.ASTRA_DB_API_ENDPOINT) {
    throw new Error("Please provide an ASTRA_DB_API_ENDPOINT");
  }

  console.time("search");
  console.timeLog("search", "Getting collection...");
  const astraClient = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN);
  const db = astraClient.db(process.env.ASTRA_DB_API_ENDPOINT);
  try {
    /**
     * @todo this should be idempotent
     */
    await db.createCollection(collectionName, { vector: { dimension: 1024 } });
  } catch {}
  const collection = db.collection(collectionName);
  console.timeLog("search", "Vectorizing query", query, "...");
  const [$vector] = await text2vec([query]);
  console.timeLog("search", "Searching...");
  const results = (
    await collection
      .find(
        {},
        { sort: { $vector: $vector! }, limit: 10, includeSimilarity: true }
      )
      .toArray()
  ).filter((r) => r.$similarity > 0.7);
  console.timeLog("search", "Got results.");
  console.timeEnd("search");
  return results;
};
