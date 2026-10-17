# Incom
+
+An investment projection app built with Next.js.

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out [the Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## Target planning

Use the **Project growth / Plan a target** toggle to switch calculators. Target
planning is available at `/en/targets` and `/es/targets`. Draft inputs and results
are kept in the current browser session when switching calculators or languages.

The browser posts to `/api/compound-interest/targets`; the Next.js route validates
and forwards the request to the deployed financial API's
`/api/v1/compound-interest/targets` endpoint. Money and percentages stay decimal
strings. Contribution solving, real-to-nominal target conversion, and annual
schedules are calculated exclusively by the API. Blank optional percentages use
server defaults; real targets require an explicit inflation assumption.

Run `pnpm test` for request/proxy and UI tests, `pnpm lint`, `pnpm typecheck`, and
`pnpm build` for the remaining checks. The target-response fixture is a captured
API response; tests mock network calls and do not require the live service.
