<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

## Compound-interest API integration

The compound-interest API is deployed at `https://incom-api.manuelji.dev/`. Use it to submit projection inputs and display the returned scenarios.

### Endpoint

```text
POST https://incom-api.manuelji.dev/api/v1/compound-interest/projections
Content-Type: application/json
```

### Request fields

| Field | Required | Description |
| --- | --- | --- |
| `initial_principal` | Yes | Starting amount as a decimal string, e.g. `"10000.00"`. |
| `recurring_contribution` | No | Omit when there are no recurring contributions. When present, provide amount as a decimal string and frequency as `monthly`, `quarterly`, or `annual`. |
| `recurring_contribution.timing` | No | `beginning` or `end`; defaults to `end`. |
| `recurring_contribution.annual_increase_percent` | No | Annual contribution increase as a percentage string; defaults to `0`. |
| `duration_years` | Yes | Integer from 1 to 100. |
| `expected_annual_return_percent` | Yes | Expected effective annual return before fees, as a percentage string. |
| `annual_fee_percent` | No | Annual fee as a percentage string; defaults to 0. For example, `"0.08"` means 0.08%, not 8%. |
| `expected_annual_inflation_percent` | No | Inflation rate as a percentage string; defaults to 2. |
| `scenario_range_percentage_points` | No | Range below/above the expected return for low/high scenarios; defaults to 2 percentage points. |

Money and percentage values must be sent as decimal strings, not JSON numbers. Omit optional fields to use their defaults; do not send `null`. Unknown fields are rejected. If `recurring_contribution` is omitted, `initial_principal` must be greater than zero.

### Example request

```json
{
  "initial_principal": "10000.00",
  "recurring_contribution": {
    "amount": "250.00",
    "frequency": "monthly",
    "timing": "end"
  },
  "duration_years": 20,
  "expected_annual_return_percent": "7",
  "annual_fee_percent": "0.08",
  "expected_annual_inflation_percent": "2.5",
  "scenario_range_percentage_points": "2"
}
```

### Response behavior

A successful request returns 200 with:

- `resolved_inputs`: inputs after applying defaults, including each default's source.
- `scenarios`: three scenarios ordered low, expected, high. Each includes a final summary and annual projection points.
- Disclosures and calculation metadata.

The scenario range is an absolute number of percentage points. For example, an expected return of 7% with a range of 2 produces low/expected/high returns of 5%, 7%, and 9%. Results are illustrative projections, not guarantees; taxes are excluded.

### Backend testing

Use this request to verify the basic no-contribution flow:

```bash
curl -X POST 'https://incom-api.manuelji.dev/api/v1/compound-interest/projections' \
  -H 'Content-Type: application/json' \
  -d '{
    "initial_principal": "10000.00",
    "duration_years": 20,
    "expected_annual_return_percent": "7"
  }'
```

Also test a request with recurring contributions, and validation failures such as an unsupported contribution frequency or a duration outside 1–100. Invalid fields generally return 422; inconsistent inputs, such as a zero initial principal with no recurring contribution, return 400. Error responses use `application/problem+json`.

Interactive API documentation may be available at <https://incom-api.manuelji.dev/docs>; the OpenAPI document may be at <https://incom-api.manuelji.dev/openapi.json>.

## Browser verification with Orca

This repo is worked on inside Orca, which has an embedded browser scoped to each worktree. When a check needs a real browser (computed styles, wrapping, overflow, viewport behavior), drive that browser with the `orca` CLI instead of saying it can't be verified. Use `orca computer …` (desktop GUI control) only for native windows or external browsers; it does not drive the embedded browser.

Before driving a tab, read the version-matched guide: `orca skills get orca-cli --reference browser`.

Find the dev server for *this* worktree. `next dev` takes the next free port when 3000 is busy, and other worktrees may hold 3000:

```bash
ss -ltnp | grep next-server              # find the port and pid
readlink /proc/<pid>/cwd                 # confirm it is this worktree
```

Typical loop:

```bash
orca tab create --url http://localhost:<port>/en --json
orca wait --load networkidle --json
orca snapshot --json                                        # refs like @e3 for click/fill
orca exec --command "set viewport 320 900" --json           # 320px; 640px ≈ 200% zoom on a 1280px window
orca eval --expression "<js returning a string>" --json     # measure getComputedStyle, line counts, scrollWidth
```

- `orca screenshot` returns a blank 1×1 image when the Orca desktop window is not visible. Use `eval` measurements as the evidence instead.
- `orca eval` results are strings; wrap returned objects in `JSON.stringify`.
- Re-run `snapshot` after any navigation; refs go stale.
- Check both locales (`/en`, `/es`). Spanish strings are longer and wrap differently.
- Avoid clicks that persist app state (such as adding a portfolio fund) unless the task requires them.

## Pull request descriptions

Use [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md) when preparing PR descriptions. Keep its required section headings exactly as written: Summary, Why, Scope, Out of scope, How to test, and Risk. Fill each with meaningful content; use `None` for Out of scope or Risk only when appropriate. Add a meaningful Large PR justification when the PR exceeds the oversized LOC threshold.
