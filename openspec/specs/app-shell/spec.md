# app-shell

## Purpose

The app-shell capability covers the root layout and global client-side providers that every route in the Next.js app renders inside.

## Requirements

### Requirement: Root layout wraps every route in global providers

The application SHALL render every route inside a root layout that applies global styles and wraps children in the shared client-side providers.

#### Scenario: Any route is rendered

- **WHEN** Next.js renders any route in the app
- **THEN** the rendered HTML uses `lang="en"`, applies the base body styles (`min-h-screen`, neutral background and foreground, antialiasing), and the route's content is nested inside the `<Providers>` component

### Requirement: TanStack Query is available to all client components

The application SHALL expose a TanStack Query `QueryClient` to every client component in the tree via `QueryClientProvider`.

#### Scenario: A client component calls a TanStack Query hook

- **WHEN** a client component anywhere in the app calls `useQuery`, `useMutation`, or another TanStack Query hook
- **THEN** the hook resolves against the `QueryClient` provided by the root `<Providers>` component without throwing a missing-provider error

### Requirement: QueryClient is created per mount and survives Fast Refresh

The application SHALL instantiate the `QueryClient` once per mount of the `<Providers>` component so that it is not shared across server requests during SSR and is preserved across React Fast Refresh.

#### Scenario: Providers mounts

- **WHEN** the `<Providers>` component mounts
- **THEN** a single `QueryClient` instance is created via `useState` and reused for the lifetime of that mount

### Requirement: Default query stale time is 60 seconds

The application SHALL configure the shared `QueryClient` with a default query `staleTime` of 60 seconds so that queries do not refetch immediately on every remount.

#### Scenario: A query is read shortly after a previous successful fetch

- **WHEN** a query is read again within 60 seconds of a previous successful fetch
- **THEN** the cached data is returned without triggering a background refetch

### Requirement: Application metadata identifies the app

The root layout SHALL expose a Next.js `Metadata` export so the document `<title>` and description identify the app.

#### Scenario: A page is rendered

- **WHEN** any page is rendered by Next.js
- **THEN** the document title is `a-flow-recorder` and the meta description describes it as a Next.js + Tailwind + TanStack Query app
