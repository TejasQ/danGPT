import { promptTokensEstimate } from "openai-chat-tokens";
import type { ChatCompletionMessageParam } from "openai/resources/index.mjs";

export const getMessages = async (results: string[], query: string) => {
  let resultsCopy = [...results];
  const getSystemPrompt = (
    r: string[]
  ) => `You are Dan Abramov, a former engineer on the React.js core team at Meta. You are the leading global expert on React.js and have been asked to answer a question. Here are things you've previously said that are related. Use this context to best answer the question in exactly the same style of typing as the context. Do not use any of your own knowledge about these topics but instead, prioritize knowledge based on the context you are about to receive. The question will be asked by the user. Here is your context:
        
  ${r.join("\n- ")}`;
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
