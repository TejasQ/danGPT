import type { APIRoute } from "astro";
import { getChatResponse } from "../../../util/getChatResponse";
import type { Stream } from "openai/streaming.mjs";
import type { ChatCompletionChunk } from "openai/resources/index.mjs";

export const GET: APIRoute = async ({ url, request }) => {
  const q = new URLSearchParams(url.search).get("q");
  if (!q) {
    return new Response("Ask something.", { status: 400 });
  }

  const answer = await getChatResponse(q, true);
  const stream = (
    answer.response as Stream<ChatCompletionChunk>
  ).toReadableStream();

  const responseStream = new ReadableStream({
    async start(controller) {
      const decoder = new TextDecoder();
      const reader = stream.getReader();
      let result = "";
      let finished = false;
      while (!finished) {
        const { value, done } = await reader.read();
        if (value) {
          const data = `data:${encodeURIComponent(
            JSON.parse(decoder.decode(value)).choices?.[0]?.delta?.content ?? ""
          )}\n\n`;
          result +=
            JSON.parse(decoder.decode(value)).choices?.[0]?.delta?.content ??
            "";
          controller.enqueue(data);
        }
        finished = done;
      }

      controller.enqueue(
        `event: sources\ndata: ${JSON.stringify(answer.sources)}\n\n`
      );
      controller.enqueue("event: done\ndata: ok\n\n");

      // Handle the connection closing
      request.signal.addEventListener("abort", () => {
        controller.close();
      });
    },
  });

  return new Response(responseStream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
};
