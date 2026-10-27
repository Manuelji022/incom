export type PortfolioFund = {
  id: string;
  code: string;
  name: string;
  investedCents: number;
  currentCents: number;
  targetBps: number;
};

export type PortfolioTotals = {
  investedCents: number;
  currentCents: number;
  growthCents: number;
  growthPercent: number | null;
  targetBps: number;
};

export type PortfolioRow = PortfolioFund & {
  currentWeight: number | null;
  differenceCents: number | null;
  differencePp: number | null;
  growthCents: number;
  growthPercent: number | null;
  status: "overweight" | "underweight" | "balanced" | "unavailable";
};

export const PORTFOLIO_STORAGE_KEY = "incom:portfolio-rebalancing:v2";
export const LEGACY_PORTFOLIO_STORAGE_KEY = "incom:portfolio-rebalancing:v1";
const MAX_SAFE_CENTS = Number.MAX_SAFE_INTEGER;

export type PortfolioMode = "sample" | "custom";
export type StoredPortfolio = { mode: PortfolioMode; funds: PortfolioFund[] };

export function parseMoneyToCents(input: string): number | null {
  const value = input.trim().replace(",", ".");
  if (!/^(?:\d+|\d+\.\d{1,2}|\.\d{1,2})$/.test(value)) return null;
  const [whole = "0", fraction = ""] = value.split(".");
  const cents = Number(whole) * 100 + Number((fraction + "00").slice(0, 2));
  return Number.isSafeInteger(cents) && cents >= 0 ? cents : null;
}

export function parseTargetToBps(input: string): number | null {
  const value = input.trim().replace(",", ".");
  if (!/^(?:\d+|\d+\.\d{1,2}|\.\d{1,2})$/.test(value)) return null;
  const [whole = "0", fraction = ""] = value.split(".");
  const bps = Number(whole) * 100 + Number((fraction + "00").slice(0, 2));
  return Number.isSafeInteger(bps) && bps <= 10_000 ? bps : null;
}

export function formatCentsForInput(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function formatBpsForInput(bps: number): string {
  return (bps / 100).toFixed(2);
}

export function calculatePortfolio(funds: readonly PortfolioFund[]) {
  const totals: PortfolioTotals = funds.reduce(
    (sum, fund) => ({
      investedCents: sum.investedCents + fund.investedCents,
      currentCents: sum.currentCents + fund.currentCents,
      growthCents: sum.growthCents + fund.currentCents - fund.investedCents,
      growthPercent: null,
      targetBps: sum.targetBps + fund.targetBps,
    }),
    { investedCents: 0, currentCents: 0, growthCents: 0, growthPercent: null, targetBps: 0 },
  );
  totals.growthPercent = totals.investedCents > 0
    ? (totals.currentCents - totals.investedCents) / totals.investedCents * 100
    : null;

  const rows = funds.map((fund): PortfolioRow => {
    const growthCents = fund.currentCents - fund.investedCents;
    const currentWeight = totals.currentCents > 0 ? fund.currentCents / totals.currentCents * 100 : null;
    const differenceCents = totals.currentCents > 0 ? fund.currentCents - totals.currentCents * fund.targetBps / 10_000 : null;
    const differencePp = currentWeight === null ? null : fund.targetBps / 100 - currentWeight;
    const status = differenceCents === null || differencePp === null
      ? "unavailable"
      : differenceCents > 0 ? "overweight" : differenceCents < 0 ? "underweight" : "balanced";
    return {
      ...fund,
      currentWeight,
      differenceCents,
      differencePp,
      growthCents,
      growthPercent: fund.investedCents > 0 ? growthCents / fund.investedCents * 100 : null,
      status,
    };
  });
  return { rows, totals, targetDifferenceBps: 10_000 - totals.targetBps };
}

export function validateFunds(value: unknown): value is PortfolioFund[] {
  if (!Array.isArray(value)) return false;
  const ids = new Set<string>();
  const codes = new Set<string>();
  for (const fund of value) {
    if (!fund || typeof fund !== "object") return false;
    const item = fund as Record<string, unknown>;
    if (typeof item.id !== "string" || item.id.length === 0 || ids.has(item.id)) return false;
    if (typeof item.code !== "string" || !item.code.trim() || codes.has(item.code.trim().toUpperCase())) return false;
    if (typeof item.name !== "string" || !item.name.trim()) return false;
    if (![item.investedCents, item.currentCents].every((n) => typeof n === "number" && Number.isSafeInteger(n) && n >= 0 && n <= MAX_SAFE_CENTS)) return false;
    if (typeof item.targetBps !== "number" || !Number.isInteger(item.targetBps) || item.targetBps < 0 || item.targetBps > 10_000) return false;
    ids.add(item.id);
    codes.add(item.code.trim().toUpperCase());
  }
  return true;
}

export function loadPortfolio(serialized: string | null): PortfolioFund[] | null {
  if (serialized === null) return null;
  try {
    const parsed: unknown = JSON.parse(serialized);
    if (!parsed || typeof parsed !== "object" || !("version" in parsed) || !("funds" in parsed) || !validateFunds(parsed.funds)) return null;
    if (parsed.version === 1) return parsed.funds;
    if (parsed.version === 2 && "mode" in parsed && (parsed.mode === "sample" || parsed.mode === "custom")) return parsed.funds;
    return null;
  } catch {
    return null;
  }
}

export function loadPortfolioState(serialized: string | null): StoredPortfolio | null {
  const funds = loadPortfolio(serialized);
  if (funds === null || serialized === null) return null;
  const parsed = JSON.parse(serialized) as { version: number; mode?: PortfolioMode };
  return {
    funds,
    mode: parsed.version === 2 && parsed.mode ? parsed.mode : funds.length > 0 ? "custom" : "sample",
  };
}

export const SAMPLE_FUNDS: PortfolioFund[] = [
  { id: "sample-northstar", code: "MOCK-GLOBAL", name: "Northstar Global Equity", investedCents: 1_200_000, currentCents: 1_480_000, targetBps: 5_500 },
  { id: "sample-harbor", code: "MOCK-BONDS", name: "Harbor Bond Index", investedCents: 700_000, currentCents: 720_000, targetBps: 2_500 },
  { id: "sample-clover", code: "MOCK-EM", name: "Clover Emerging Markets", investedCents: 500_000, currentCents: 620_000, targetBps: 2_000 },
];

/** @deprecated Use SAMPLE_FUNDS for the three-fund sample portfolio. */
export const DEMO_FUNDS = SAMPLE_FUNDS;
