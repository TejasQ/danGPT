import { getChatResponse } from "@/util/getChatResponse";
import ReactMarkdown from "react-markdown";
import { Form } from "./Form";

type Source = {
  id: string;
  datetime: number;
  name: string;
  avatarUrl: string;
  handle: string;
  text: string;
};

export const maxDuration = 300;

export default async function Home({
  searchParams,
}: {
  searchParams: Record<string, string>;
}) {
  const answer = searchParams.q
    ? await getChatResponse(searchParams.q)
    : { result: "", sources: [] };

  return (
    <main className="flex min-h-screen max-w-screen-lg w-full mx-auto flex-col items-center justify-center gap-8 p-8">
      <img
        alt="DanGPT"
        src="/dangpt.jpeg"
        width="200"
        height="200"
        className="rounded-full"
      />
      <Form query={searchParams.q} />
      {searchParams.q && (
        <>
          <div className="grid text-lg gap-4">
            <ReactMarkdown>{answer.result}</ReactMarkdown>
          </div>
          <hr />
          <h2 className="text-2xl font-semibold">Sources</h2>
          <ul className="w-full md:columns-3 gap-4">
            {answer.sources.map((source: Source, i) => (
              <li key={i} className="w-full">
                <div className="break-inside-avoid-column border mb-4 grid gap-4 border-neutral-400 rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <img
                      alt={`${source.name}'s avatar`}
                      src={source.avatarUrl}
                      width="48"
                      height="48"
                      className="rounded-full"
                    />
                    <div className="flex flex-col gap-0 leading-none">
                      <span className="font-bold">{source.name}</span>
                      <span className="text-neutral-500 text-sm">
                        @{source.handle}
                      </span>
                    </div>
                  </div>
                  <div>
                    <ReactMarkdown>{source.text}</ReactMarkdown>
                  </div>
                  <div className="flex items-center text-sm justify-between">
                    <span>
                      {Intl.DateTimeFormat("en-US").format(
                        new Date(source.datetime)
                      )}
                    </span>
                    <a
                      target="_blank"
                      href={`https://x.com/${source.handle}/status/${source.id}`}
                      className="shrink-0"
                    >
                      Read on 𝕏 &rarr;
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
      <div className="text-xs">
        Even with RAG, this still may be inaccurate.{" "}
        <a
          className="underline underline-offset-2"
          target="_blank"
          href="https://x.com/dan_abramov2"
        >
          Real Dan
        </a>{" "}
        is always the truest source of information. Built as a side hobby
        project by{" "}
        <a
          className="underline underline-offset-2"
          href="https://x.com/tejaskumar_"
        >
          Tejas
        </a>
        .
      </div>
    </main>
  );
}
