import OpenAI from "openpipe/openai";
import { search } from "./search";
import { getMessages } from "./getMessages";
import type { Stream } from "openai/streaming.mjs";
import type {
  ChatCompletion,
  ChatCompletionChunk,
} from "openai/resources/index.mjs";
import type { Source } from "./types";

type GetChatResponse = {
  response: Stream<ChatCompletionChunk> | ChatCompletion;
  sources: Source[];
};

export const getChatResponse = async <T extends boolean>(
  query: string,
  stream: T
): Promise<GetChatResponse> => {
  const results = await search(query);
  const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

  console.time("chatgpt");
  console.timeLog("chatgpt", "Asking GPT-3.5...");

  try {
    const response: any = await openai.chat.completions.create({
      model: "gpt-4-turbo-preview",
      stream: Boolean(stream),
      messages: await getMessages(
        results.map((r) => r.text),
        query
      ),
      openpipe: {
        logRequest: true,
      },
    });
    console.timeLog("chatgpt", "Got response.");
    console.timeEnd("chatgpt");

    return {
      response,
      sources: results.map((r) => {
        const { $vector, ...rest } = r;

        /**
         * @todo fix this with DataStax
         */
        return rest as unknown as Source;
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
      } as ChatCompletion,
      sources: [] as Source[],
    };
  }
};
