import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, unlink } from "node:fs/promises";
import { homedir, tmpdir } from "node:os";
import { join } from "node:path";
import { NextResponse } from "next/server";

const USER_DATA_DIR = join(homedir(), ".a-flow-recorder", "profile");

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 3600;

let active: { proc: ReturnType<typeof spawn>; outputPath: string } | null =
  null;

export async function POST(req: Request) {
  if (active) {
    return NextResponse.json(
      { error: "A recording is already in progress." },
      { status: 409 },
    );
  }

  let url: string;
  try {
    const body = (await req.json()) as { url?: unknown };
    if (typeof body.url !== "string" || body.url.trim() === "") {
      throw new Error("missing url");
    }
    url = new URL(body.url).toString();
  } catch {
    return NextResponse.json(
      { error: "A valid URL is required." },
      { status: 400 },
    );
  }

  const outputPath = join(tmpdir(), `a-flow-recorder-${randomUUID()}.js`);

  await mkdir(USER_DATA_DIR, { recursive: true });

  const proc = spawn(
    "pnpm",
    [
      "exec",
      "playwright",
      "codegen",
      "--target",
      "javascript",
      "--user-data-dir",
      USER_DATA_DIR,
      "--output",
      outputPath,
      url,
    ],
    { stdio: "ignore" },
  );

  active = { proc, outputPath };

  const exitCode = await new Promise<number | null>((resolve) => {
    proc.once("error", () => resolve(null));
    proc.once("exit", (code) => resolve(code));
  });

  active = null;

  if (exitCode !== 0 && exitCode !== null) {
    await unlink(outputPath).catch(() => {});
    return NextResponse.json(
      { error: `Recorder exited with code ${exitCode}.` },
      { status: 500 },
    );
  }

  let script: string;
  try {
    script = await readFile(outputPath, "utf8");
  } catch {
    return NextResponse.json(
      { error: "No script was produced (browser closed before any action?)." },
      { status: 500 },
    );
  } finally {
    await unlink(outputPath).catch(() => {});
  }

  return NextResponse.json({ script });
}
