# Incom

An investment projection app built with Next.js.

## Getting started

Run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## Project structure

```text
src/
  app/                         Next.js pages, layouts, and route handlers
  features/
    compound-calculator/       Calculator UI and feature logic
      api/                      Projection API client and route behavior
      components/               Calculator-specific React components
      lib/                      Calculator helpers and session state
      types/                    Calculator domain types
  components/
    primitives/                 Reusable, feature-agnostic UI controls
    header.tsx                  Shared app shell components live at this level
    footer.tsx
    language-switcher.tsx
    theme-toggle.tsx
  lib/                          Utilities shared across features
  proxy.ts                      Next.js request proxy
```

Keep Next.js route files in `src/app`. Pages should compose feature entry points, and route handlers should delegate feature behavior to the owning feature folder. Add new feature code under `src/features/<feature-name>/`; keep its components, API integration, helpers, and types together. Put controls in `src/components/primitives/` only when they are reusable across features, and keep truly shared utilities in `src/lib/`. Create feature folders when they have code to hold.

## Target planning

Use the **Project growth / Plan a target** toggle on `/en` or `/es` to switch
calculators without leaving the page. Draft inputs and results are kept in the
current browser session when switching calculators or languages.

The browser posts to `/api/compound-interest/targets`; the Next.js route validates
and forwards the request to the deployed financial API's
`/api/v1/compound-interest/targets` endpoint. Money and percentages stay decimal
strings. Contribution solving, real-to-nominal target conversion, and annual
schedules are calculated exclusively by the API. Blank optional percentages use
server defaults; real targets require an explicit inflation assumption.

Run `pnpm test` for request/proxy and UI tests, `pnpm lint`, `pnpm typecheck`, and
`pnpm build` for the remaining checks. The target-response fixture is a captured
API response; tests mock network calls and do not require the live service.
