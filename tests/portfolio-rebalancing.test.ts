import { describe, expect, it } from "vitest";
import { calculatePortfolio, loadPortfolio, loadPortfolioState, SAMPLE_FUNDS, parseMoneyToCents, parseTargetToBps, validateFunds, type PortfolioFund } from "@/features/portfolio-rebalancing/lib/portfolio";

const fixture: PortfolioFund[] = [
  { id: "fund-a", code: "FUND-A", name: "Fund A", investedCents: 800_000, currentCents: 900_000, targetBps: 5_000 },
  { id: "fund-b", code: "FUND-B", name: "Fund B", investedCents: 200_000, currentCents: 300_000, targetBps: 5_000 },
];

describe("portfolio calculations", () => {
  it("provides a valid three-fund fictional sample with targets totaling 100%", () => {
    expect(SAMPLE_FUNDS).toHaveLength(3);
    expect(validateFunds(SAMPLE_FUNDS)).toBe(true);
    expect(calculatePortfolio(SAMPLE_FUNDS).totals.targetBps).toBe(10_000);
  });

  it("calculates row values and totals from source amounts", () => {
    const { rows, totals } = calculatePortfolio(fixture);
    expect(totals).toMatchObject({ investedCents: 1_000_000, currentCents: 1_200_000, growthCents: 200_000, growthPercent: 20 });
    expect(rows.map(({ currentWeight, differenceCents, differencePp, growthPercent }) => ({ currentWeight, differenceCents, differencePp, growthPercent }))).toEqual([
      { currentWeight: 75, differenceCents: 300_000, differencePp: -25, growthPercent: 12.5 },
      { currentWeight: 25, differenceCents: -300_000, differencePp: 25, growthPercent: 50 },
    ]);
  });

  it("does not average individual returns for portfolio growth", () => {
    const { totals } = calculatePortfolio(fixture);
    expect(totals.growthPercent).toBe(20);
    expect(totals.growthPercent).not.toBe((12.5 + 50) / 2);
  });

  it("uses positive euro difference for overweight and positive pp for underweight", () => {
    const { rows } = calculatePortfolio(fixture);
    expect(rows[0].differenceCents).toBeGreaterThan(0);
    expect(rows[0].differencePp).toBeLessThan(0);
    expect(rows[1].differenceCents).toBeLessThan(0);
    expect(rows[1].differencePp).toBeGreaterThan(0);
  });

  it("requires an exact integer-basis-point target total", () => {
    expect(calculatePortfolio(fixture).totals.targetBps).toBe(10_000);
    expect(calculatePortfolio([{ ...fixture[0], targetBps: 5_001 }, fixture[1]]).totals.targetBps).toBe(10_001);
    expect(parseTargetToBps("50.001")).toBeNull();
    expect(parseTargetToBps("100.01")).toBeNull();
  });

  it("handles zero invested capital and zero portfolio value without non-finite values", () => {
    const zeroInvested = calculatePortfolio([{ ...fixture[0], investedCents: 0 }]);
    expect(zeroInvested.rows[0].growthCents).toBe(900_000);
    expect(zeroInvested.rows[0].growthPercent).toBeNull();
    const zeroValue = calculatePortfolio(fixture.map((fund) => ({ ...fund, currentCents: 0 })));
    expect(zeroValue.rows.every((row) => row.currentWeight === null && row.differenceCents === null && row.status === "unavailable")).toBe(true);
    expect(zeroValue.totals.growthPercent).toBe(-100);
    expect(JSON.stringify(zeroValue)).not.toMatch(/NaN|Infinity/);
  });
});

describe("portfolio input and persistence validation", () => {
  it("parses nonnegative cents and basis points without float drift", () => {
    expect(parseMoneyToCents("8.001")).toBeNull();
    expect(parseMoneyToCents("-1")).toBeNull();
    expect(parseMoneyToCents("1.20")).toBe(120);
    expect(parseMoneyToCents("1,20")).toBe(120);
    expect(parseTargetToBps("99.99")).toBe(9_999);
    expect(parseTargetToBps("")).toBeNull();
  });

  it("allows omitted codes while rejecting duplicate non-empty codes", () => {
    expect(validateFunds([{ ...fixture[0], code: "" }, { ...fixture[1], code: "" }])).toBe(true);
    expect(validateFunds([{ ...fixture[0], code: "  " }, { ...fixture[1], code: "" }])).toBe(true);
    expect(validateFunds([{ ...fixture[0] }, { ...fixture[1], code: "fund-a" }])).toBe(false);
  });

  it("rejects malformed or unsupported stored data", () => {
    expect(loadPortfolio("not json")).toBeNull();
    expect(loadPortfolio(JSON.stringify({ version: 2, funds: fixture }))).toBeNull();
    expect(loadPortfolio(JSON.stringify({ version: 1, funds: fixture }))).toEqual(fixture);
    expect(loadPortfolioState(JSON.stringify({ version: 1, funds: fixture }))).toEqual({ funds: fixture, mode: "custom" });
    expect(loadPortfolioState(JSON.stringify({ version: 1, funds: [] }))).toEqual({ funds: [], mode: "sample" });
  });
});
