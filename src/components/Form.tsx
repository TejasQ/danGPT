import { useRef, useState, type Dispatch, type SetStateAction } from "react";
import type { Source } from "../../util/types";

type Props = {
  query: string;
  onUpdate: {
    setAnswer: Dispatch<SetStateAction<string>>;
    setSources: Dispatch<SetStateAction<Source[]>>;
  };
};

export const Form = ({ query, onUpdate }: Props) => {
  const [pending, setPending] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <form
      className="flex w-full gap-4"
      method="get"
      action="/"
      onSubmit={async (e) => {
        e.preventDefault();
        setPending(true);
        if (!inputRef.current?.value) {
          alert("Ask something.");
          return;
        }
        window.history.replaceState(
          {},
          "",
          "/?q=" + encodeURIComponent(inputRef.current.value)
        );
        onUpdate.setAnswer("");
        const eventSource = new EventSource(
          "/api/ask?q=" + encodeURIComponent(inputRef.current.value)
        );
        eventSource.addEventListener("message", (e) => {
          onUpdate.setAnswer((a) => a + decodeURIComponent(e.data));
        });
        eventSource.addEventListener("done", () => {
          eventSource.close();
          setPending(false);
        });
        eventSource.addEventListener("sources", (e) => {
          console.log("BIG SOURCES", e.data);
          onUpdate.setSources(JSON.parse(e.data));
        });
        eventSource.addEventListener("error", () => {
          onUpdate.setAnswer(
            (a) =>
              a +
              " ...sorry, the whole world is using this and we're being rate limited because of heavy load. Try again in 30 seconds or much, much later."
          );
          eventSource.close();
          setPending(false);
        });
      }}
    >
      <input
        placeholder="Explain RSCs to me"
        name="q"
        ref={inputRef}
        autoComplete="off"
        type="text"
        disabled={pending}
        defaultValue={query}
        className="border grow border-neutral-400 rounded p-2 w-full"
      />
      <input
        type="submit"
        disabled={pending}
        className={`${
          pending ? "animate-spin" : ""
        } bg-black rounded hover:bg-red-500 hover:text-black text-red-400 px-4 border-2 border-red-500`}
        value={pending ? "Asking..." : "Ask"}
      />
    </form>
  );
};
