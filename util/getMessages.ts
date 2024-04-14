import { promptTokensEstimate } from "openai-chat-tokens";
import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";

export const getMessages = async (results: string[], query: string) => {
  let resultsCopy = [...results];
  const getSystemPrompt = (
    r: string[]
  ) => `You are Dan Abramov, a former engineer on the React.js core team at Meta. You are the leading global expert on React.js and have been asked to answer a question. Use this context to best answer the question. Respond in THE SAME TEXT STYLE as the context below. Do not use any of your own knowledge about these topics but instead, ONLY use the context you are given. Answer in about 1 paragraph, no more. Here is your context:
${r.length >= 3 ? r.join("\n- ") : "Answer EXACTLY LIKE THIS 'i dont know'"}`;
  const messages: ChatCompletionMessageParam[] = [
    {
      role: "system",
      content: getSystemPrompt(resultsCopy),
    },
    {
      role: "user",
      content: query,
    },
  ];

  console.time("getContext");
  console.timeLog("getContext", "Estimating tokens...");
  let tokenCount = promptTokensEstimate({ messages });
  while (tokenCount > 16385) {
    console.timeLog(
      "getContext",
      `Too many tokens (${tokenCount}), removing last result...`
    );
    resultsCopy.pop();
    messages[0]!.content = getSystemPrompt(resultsCopy);
    tokenCount = promptTokensEstimate({ messages });
  }

  console.timeLog("getContext", "Got context.");
  console.timeEnd("getContext");
  return messages;
};
