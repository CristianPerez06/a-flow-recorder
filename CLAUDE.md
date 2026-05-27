# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

Package manager is **pnpm** (see `pnpm-workspace.yaml`; `sharp` is allow-listed for native builds).

- `pnpm dev` — start the Next.js dev server
- `pnpm build` — production build
- `pnpm start` — run the production server
- `pnpm lint` — run `next lint`

No test runner is configured.

## Architecture

Next.js 15 App Router with React 19, Tailwind v4, and TanStack Query v5. TypeScript strict mode, path alias `@/*` → `./src/*`.

- `src/app/layout.tsx` — root layout; wraps all routes in `<Providers>`.
- `src/app/providers.tsx` — client component that instantiates a per-mount `QueryClient` via `useState` (so it survives Fast Refresh but isn't shared across requests during SSR) with a default `staleTime` of 60s. Any new global client-side context providers belong here.
- `src/app/page.tsx` — example client page using `useQuery` against a public joke API; serves as the reference pattern for data fetching on the client.
- `src/app/globals.css` — Tailwind v4 entry (`@import "tailwindcss"`); no `tailwind.config` file — configuration is CSS-first via Tailwind v4.
- Tailwind is wired through `@tailwindcss/postcss` in `postcss.config.mjs`.

Routes that need React Query must be Client Components (`"use client"`); server components can render around them but shouldn't call hooks.
