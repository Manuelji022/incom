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
