"use client";
import { useState } from "react";

type Props = {
  query: string;
};

export const Form = ({ query }: Props) => {
  const [pending, setPending] = useState(false);
  return (
    <form
      className="flex w-full gap-4"
      method="get"
      action="/"
      onSubmit={(e) => {
        e.preventDefault();
        setPending(true);
        window.location.href = `/?q=${encodeURIComponent(
          (document.querySelector("input[name=q]") as HTMLInputElement).value
        )}`;
      }}
    >
      <input
        placeholder="Explain RSCs to me"
        name="q"
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
