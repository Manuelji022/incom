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

## Pull request descriptions

Use [`.github/PULL_REQUEST_TEMPLATE.md`](.github/PULL_REQUEST_TEMPLATE.md) when preparing PR descriptions. Keep its required section headings exactly as written: Summary, Why, Scope, Out of scope, How to test, and Risk. Fill each with meaningful content; use `None` for Out of scope or Risk only when appropriate. Add a meaningful Large PR justification when the PR exceeds the oversized LOC threshold.
