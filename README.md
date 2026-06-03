# a-flow-recorder

A small local-only Next.js 15 app that wraps Playwright's `codegen` behind a one-page UI. Type a URL, drive a real browser, and get back a runnable Playwright JavaScript script for that flow.

## What it does

1. The user opens the app and types a target URL into the form on `/`.
2. The page POSTs to `/api/record`, which spawns `playwright codegen` on the Node runtime, pointed at that URL. The form is locked while a session is active.
3. A real Chromium window opens with Playwright's codegen attached. The user clicks, types and navigates as they normally would — codegen transcribes each interaction into Playwright JavaScript.
4. When the user closes the browser, codegen exits, the server reads the temp script file, deletes it, and returns the script to the page.
5. The UI renders the script in a code block with a **Copy** button and a reminder to scrub sensitive data (credentials, tokens captured in selectors) before sharing.

### Output

- A JavaScript Playwright script returned as `{ "script": "..." }` from `POST /api/record` and displayed on the home page.
- Drop it into a Playwright project and run it to replay the flow.
- The temp file is deleted server-side after read — the browser is the only place the script ends up.

### Notable behavior

- **One recording at a time** per server process — concurrent POSTs get `409 A recording is already in progress.`
- **Persistent browser profile** at `~/.a-flow-recorder/profile` via `--user-data-dir`, so logins and cookies survive between recordings.
- **Long-running route:** `runtime = "nodejs"`, `dynamic = "force-dynamic"`, `maxDuration = 3600` to cover hour-long interactive sessions.

## Running the app

### Prerequisites

- Node.js 20+
- [pnpm](https://pnpm.io/) (the workspace's package manager)
- A desktop environment (the app launches a real Chromium window — it will not work on a headless server)

### First-time setup

```bash
pnpm install
pnpm exec playwright install chromium
```

The second command downloads the Chromium build that `playwright codegen` drives.

### Start the dev server

```bash
pnpm dev
```

Then open <http://localhost:3000>, enter a URL (e.g. `https://example.com`), and click **Start recording**. A Chromium window will open — perform your flow, then close the window to get the generated script back in the UI.

### Other commands

- `pnpm build` — production build
- `pnpm start` — run the production server
- `pnpm lint` — run `next lint`
