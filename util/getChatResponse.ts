import OpenAI from "openai";
import { search } from "./search";
import { getMessages } from "./getMessages";
import type { Stream } from "openai/streaming.mjs";
import type { FoundDoc, SomeDoc } from "@datastax/astra-db-ts";
import type {
  ChatCompletion,
  ChatCompletionChunk,
} from "openai/resources/index.mjs";

type GetChatResponse = {
  response: Stream<ChatCompletionChunk> | ChatCompletion;
  sources: FoundDoc<SomeDoc>[];
};

export const getChatResponse = async <T extends boolean>(
  query: string,
  stream?: T
): Promise<GetChatResponse> => {
  const results = await search(query);
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  console.time("chatgpt");
  console.timeLog("chatgpt", "Asking GPT-3.5...");

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      stream: Boolean(stream),
      messages: await getMessages(
        results.map((r) => r.text),
        query
      ),
    });
    console.timeLog("chatgpt", "Got response.");
    console.timeEnd("chatgpt");

    return {
      response: stream
        ? (response as Stream<OpenAI.Chat.Completions.ChatCompletionChunk>)
        : (response as OpenAI.Chat.Completions.ChatCompletion),
      sources: results.map((r) => {
        const { $vector, ...rest } = r;
        return rest;
      }),
    };
  } catch (e: any) {
    console.error(e);
    return {
      response: {
        choices: [
          {
            finish_reason: "stop",
            index: 0,
            logprobs: null,
            message: {
              content:
                "Sorry, the whole world is using this and we're being rate limited because of heavy load." +
                e.message.split(".")[2] +
                " seconds or much, much later.",
              role: "assistant",
            },
          },
        ],
      } as OpenAI.Chat.Completions.ChatCompletion,
      sources: [],
    };
  }
};
