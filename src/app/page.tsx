"use client";

import { useMutation } from "@tanstack/react-query";
import { useState } from "react";

async function startRecording(url: string): Promise<string> {
  const res = await fetch("/api/record", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ url }),
  });
  const data = (await res.json()) as { script?: string; error?: string };
  if (!res.ok) throw new Error(data.error ?? "Recording failed.");
  return data.script ?? "";
}

export default function Home() {
  const [url, setUrl] = useState("");
  const [copied, setCopied] = useState(false);

  const { mutate, data: script, isPending, isError, error, reset } =
    useMutation({
      mutationFn: startRecording,
    });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!url.trim() || isPending) return;
    setCopied(false);
    reset();
    mutate(url.trim());
  };

  const handleCopy = async () => {
    if (!script) return;
    await navigator.clipboard.writeText(script);
    setCopied(true);
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-3xl flex-col gap-6 p-8">
      <header className="space-y-1">
        <h1 className="text-3xl font-semibold">a-flow-recorder</h1>
        <p className="text-sm text-neutral-600">
          Record a browser flow with Playwright. Type a URL, click Start, drive
          the browser, then close it to get the script.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="url"
          required
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://example.com"
          disabled={isPending}
          className="flex-1 rounded-lg border border-neutral-300 bg-white px-3 py-2 text-sm shadow-sm outline-none focus:border-neutral-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isPending || !url.trim()}
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-700 disabled:opacity-50"
        >
          {isPending ? "Recording…" : "Start recording"}
        </button>
      </form>

      {isPending && (
        <p className="text-sm text-neutral-600">
          A browser window is open. Perform the actions you want to record, then
          close the browser to finish.
        </p>
      )}

      {isError && (
        <p className="text-sm text-red-600">
          {error instanceof Error ? error.message : "Something went wrong."}
        </p>
      )}

      {script !== undefined && !isPending && (
        <section className="space-y-2">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-neutral-700">
              Generated script
            </h2>
            <button
              type="button"
              onClick={handleCopy}
              className="rounded-md border border-neutral-300 bg-white px-2.5 py-1 text-xs font-medium text-neutral-700 transition hover:bg-neutral-100"
            >
              Copy
            </button>
          </div>
          {copied && (
            <div
              role="status"
              className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-900"
            >
              Script copied to the clipboard.{" "}
              <strong className="font-semibold">Important:</strong> remember to
              remove any sensitive data from it before sharing or saving.
            </div>
          )}
          <pre
            tabIndex={0}
            className="max-h-[60vh] overflow-auto rounded-lg border border-neutral-200 bg-neutral-900 p-4 text-xs leading-relaxed text-neutral-100"
          >
            {script || "// No actions were recorded."}
          </pre>
        </section>
      )}
    </main>
  );
}
