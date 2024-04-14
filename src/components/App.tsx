import { useState } from "react";
import type { Source } from "../../util/types";
import { replaceTwitterHandles } from "../../util/replaceTwitterHandles";
import { Form } from "./Form";
import ReactMarkdown from "react-markdown";

type AppProps = {
  initialQuery: string;
  initialAnswer: string;
  initialSources: Source[];
};

export function App({ initialQuery, initialAnswer, initialSources }: AppProps) {
  const [answer, setAnswer] = useState(initialAnswer);
  const [sources, setSources] = useState(initialSources);

  return (
    <>
      <Form onUpdate={{ setAnswer, setSources }} query={initialQuery ?? ""} />
      {answer && (
        <>
          <div className="grid text-lg gap-4">
            <ReactMarkdown>{answer}</ReactMarkdown>
          </div>
          <hr />
          <h2 className="text-2xl font-semibold">Sources</h2>
          <ul className="w-full md:columns-3 gap-4">
            {sources.map((source) => (
              <li className="w-full">
                <div className="break-inside-avoid-column border mb-4 grid gap-4 border-neutral-400 rounded-lg p-4">
                  <div className="flex items-center gap-4">
                    <img
                      alt={`${source.authorName}'s avatar`}
                      src={source.authorAvatarUrl}
                      width="48"
                      height="48"
                      className="rounded-full"
                    />
                    <div className="flex flex-col gap-0 leading-none">
                      <span className="font-bold">{source.authorName}</span>
                      <span className="text-neutral-500 text-sm">
                        @{source.authorHandle}
                      </span>
                    </div>
                  </div>
                  <div>
                    <ReactMarkdown>
                      {replaceTwitterHandles(source.text)}
                    </ReactMarkdown>
                  </div>
                  <div className="flex items-center text-sm justify-between">
                    <span>
                      {Intl.DateTimeFormat("en-US").format(
                        new Date(source.datetime * 1000)
                      )}
                    </span>
                    <a
                      target="_blank"
                      href={`https://x.com/${source.authorHandle}/status/${source.id}`}
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
    </>
  );
}
