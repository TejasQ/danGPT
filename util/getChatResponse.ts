import OpenAI from "openai";
import { search } from "./search";
import { getMessages } from "./getMessages";

export const getChatResponse = async (query: string) => {
  const results = await search(query);
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  console.time("chatgpt");
  console.timeLog("chatgpt", "Asking GPT-3.5...");

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      stream: false,
      messages: await getMessages(
        results.map((r) => r.text),
        query
      ),
    });
    console.timeLog("chatgpt", "Got response.");
    console.timeEnd("chatgpt");

    return {
      result: response.choices[0].message.content,
      sources: results,
    };
  } catch (e: any) {
    console.error(e);
    return {
      result:
        "Sorry, the whole world is using this and we're being rate limited because of heavy load." +
        e.message.split(".")[2] +
        " seconds or much, much later.",
      sources: [],
    };
  }
};
