"use client";

import { useQuery } from "@tanstack/react-query";

type Joke = { id: number; type: string; setup: string; punchline: string };

async function fetchJoke(): Promise<Joke> {
  const res = await fetch("https://official-joke-api.appspot.com/random_joke");
  if (!res.ok) throw new Error("Failed to fetch joke");
  return res.json();
}

export default function Home() {
  const { data, isFetching, isError, refetch } = useQuery({
    queryKey: ["joke"],
    queryFn: fetchJoke,
  });

  return (
    <main className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-semibold">Next.js + Tailwind + Tanstack Query</h1>

      <section className="w-full rounded-xl border border-neutral-200 bg-white p-6 shadow-sm">
        {isError ? (
          <p className="text-red-600">Something went wrong.</p>
        ) : data ? (
          <div className="space-y-2">
            <p className="font-medium">{data.setup}</p>
            <p className="text-neutral-600">{data.punchline}</p>
          </div>
        ) : (
          <p className="text-neutral-500">Loading…</p>
        )}
      </section>

      <button
        onClick={() => refetch()}
        disabled={isFetching}
        className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50"
      >
        {isFetching ? "Loading…" : "New joke"}
      </button>
    </main>
  );
}
