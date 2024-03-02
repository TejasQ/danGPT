import { AstraDB } from "@datastax/astra-db-ts";
import { collectionName } from "./collectionName";

type Document = {
  text: string;
  $vector: number[];
};

export const storeInDb = async (documents: Document[]) => {
  const astraClient = new AstraDB(
    process.env.ASTRA_DB_APPLICATION_TOKEN,
    process.env.ASTRA_DB_API_ENDPOINT
  );
  await astraClient.createCollection(collectionName, {
    vector: { dimension: 1024, metric: "cosine" },
  });
  const collection = await astraClient.collection(collectionName);
  let currentIndex = 0;
  let length = currentIndex + 10;
  /** 👇 This should be done in the client; it currently panics because "request entity too large". */
  while (currentIndex < documents.length) {
    await collection.insertMany(documents.slice(currentIndex, length));
    console.log(`Inserted ${length} documents`);
    currentIndex = length;
    length = currentIndex + 10;
  }
  return true;
};
