"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  columnVisibilityFeature,
  createColumnHelper,
  createSortedRowModel,
  metaHelper,
  rowSortingFeature,
  sortFn_basic,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { DataTable, type DataTableColumnMeta } from "@/components/data-table";
import { Button } from "@/components/primitives/button";
import { DecimalInput } from "@/components/primitives/decimal-input";
import { Input } from "@/components/primitives/input";
import { TableCellInput, TableEmpty } from "@/components/primitives/table";
import type { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/locales";
import { getCurrencyFormatter } from "@/lib/currency";
import {
  calculatePortfolio,
  SAMPLE_FUNDS,
  formatBpsForInput,
  formatCentsForInput,
  loadPortfolioState,
  parseMoneyToCents,
  parseTargetToBps,
  PORTFOLIO_STORAGE_KEY,
  LEGACY_PORTFOLIO_STORAGE_KEY,
  type PortfolioFund,
  type PortfolioMode,
  type PortfolioRow,
} from "../lib/portfolio";

type Copy = ReturnType<typeof getDictionary>["portfolio"];
const portfolioTableFeatures = tableFeatures({
  rowSortingFeature,
  columnVisibilityFeature,
  sortedRowModel: createSortedRowModel(),
  sortFns: { basic: sortFn_basic },
  columnMeta: metaHelper<DataTableColumnMeta>(),
});
const columnHelper = createColumnHelper<typeof portfolioTableFeatures, PortfolioRow>();
const numeric = { align: "end", numeric: true } as const;
const columns = columnHelper.columns([
  columnHelper.accessor("name", { header: "fund", sortFn: "basic", meta: { sticky: true, rowHeader: true, className: "w-44 min-w-44 sm:w-64 sm:min-w-64" } }),
  columnHelper.accessor("code", { header: "code", sortFn: "basic", meta: { className: "min-w-28" } }),
  columnHelper.group({ id: "valuation", header: "valuation", columns: columnHelper.columns([
    columnHelper.accessor("investedCents", { header: "invested", sortFn: "basic", meta: { ...numeric, className: "min-w-36" } }),
    columnHelper.accessor("currentCents", { header: "current", sortFn: "basic", meta: { ...numeric, className: "min-w-36" } }),
  ]) }),
  columnHelper.group({ id: "allocation", header: "allocation", columns: columnHelper.columns([
    columnHelper.accessor((row) => row.currentWeight, { id: "currentWeight", header: "currentWeight", sortFn: "basic", meta: numeric }),
    columnHelper.accessor("targetBps", { header: "targetBps", sortFn: "basic", meta: { ...numeric, className: "min-w-28" } }),
    columnHelper.accessor((row) => row.differenceCents, { id: "differenceCents", header: "differenceCents", sortFn: "basic", meta: numeric }),
    columnHelper.accessor((row) => row.differencePp, { id: "differencePp", header: "differencePp", sortFn: "basic", meta: numeric }),
  ]) }),
  columnHelper.group({ id: "return", header: "return", columns: columnHelper.columns([
    columnHelper.accessor((row) => row.growthPercent, { id: "growthPercent", header: "growthPercent", sortFn: "basic", meta: numeric }),
    columnHelper.accessor("growthCents", { header: "growthCents", sortFn: "basic", meta: numeric }),
  ]) }),
]);

const statusTone = {
  overweight: "text-warning-foreground",
  underweight: "text-brand-foreground",
  balanced: "text-secondary-foreground",
  unavailable: "text-secondary-foreground",
} as const;

type Draft = { value: string; error?: string };
type AddDraft = { code: string; name: string; invested: string; current: string; target: string };
const emptyAdd: AddDraft = { code: "", name: "", invested: "", current: "", target: "" };

function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `fund-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function PortfolioTracker({ locale, copy, languageLabel, themeLabel }: { locale: Locale; copy: Copy; languageLabel: string; themeLabel: string }) {
  const [funds, setFunds] = useState<PortfolioFund[]>(SAMPLE_FUNDS);
  const [mode, setMode] = useState<PortfolioMode>("sample");
  const [loaded, setLoaded] = useState(false);
  const [storageUnavailable, setStorageUnavailable] = useState(false);
  const [drafts, setDrafts] = useState<Record<string, Draft>>({});
  const [addDraft, setAddDraft] = useState<AddDraft>(emptyAdd);
  const [addErrors, setAddErrors] = useState<Partial<Record<keyof AddDraft, string>>>({});
  const [addErrorAnnouncement, setAddErrorAnnouncement] = useState("");
  const addTriggerRef = useRef<HTMLButtonElement>(null);
  const addInputRefs = useRef<Partial<Record<keyof AddDraft, HTMLInputElement | null>>>({});
  const [showAdd, setShowAdd] = useState(false);
  const [deleted, setDeleted] = useState<PortfolioFund | null>(null);
  const formatter = useMemo(() => getCurrencyFormatter(locale, "EUR", { minimumFractionDigits: 2, maximumFractionDigits: 2 }), [locale]);
  const percentFormatter = useMemo(() => new Intl.NumberFormat(locale === "es" ? "es-ES" : "en-IE", { minimumFractionDigits: 2, maximumFractionDigits: 2 }), [locale]);
  const signedMoney = (cents: number) => `${cents > 0 ? "+" : ""}${formatter.format(cents / 100)}`;
  const computed = useMemo(() => calculatePortfolio(funds), [funds]);

  useEffect(() => {
    let active = true;
    void Promise.resolve().then(() => {
      if (!active) return;
      try {
        const current = loadPortfolioState(window.localStorage.getItem(PORTFOLIO_STORAGE_KEY));
        const legacy = current === null ? loadPortfolioState(window.localStorage.getItem(LEGACY_PORTFOLIO_STORAGE_KEY)) : null;
        const stored = current ?? legacy;
        if (stored !== null) {
          setMode(stored.mode);
          setFunds(stored.mode === "sample" && stored.funds.length === 0 ? SAMPLE_FUNDS : stored.funds);
        }
      } catch {
        setStorageUnavailable(true);
      }
      setLoaded(true);
    });
    return () => { active = false; };
  }, []);

  useEffect(() => {
    if (!loaded) return;
    try {
      window.localStorage.setItem(PORTFOLIO_STORAGE_KEY, JSON.stringify({ version: 2, mode, funds }));
    } catch {
      queueMicrotask(() => setStorageUnavailable(true));
    }
  }, [funds, loaded, mode]);

  // Codes are optional; the column only appears once at least one fund has one.
  const hasCodes = funds.some((fund) => fund.code.trim() !== "");
  const table = useTable({ features: portfolioTableFeatures, columns, data: computed.rows, getRowId: (row) => row.id, state: { columnVisibility: { code: hasCodes } } }, (state) => ({ sorting: state.sorting }));
  const groupLabels: Record<string, string> = {
    valuation: copy.valuation, allocation: copy.allocation, return: copy.return,
    code: copy.code, name: copy.fund, investedCents: copy.invested, currentCents: copy.current, currentWeight: copy.currentWeight,
    targetBps: copy.targetWeight, differenceCents: copy.difference, differencePp: copy.differencePp,
    growthPercent: copy.growth, growthCents: copy.growthEuro,
  };

  function renderValue(row: PortfolioRow, id: string) {
    if (id === "code" || id === "name") return row[id];
    if (id === "investedCents") return formatter.format(row.investedCents / 100);
    if (id === "currentCents") return formatter.format(row.currentCents / 100);
    if (id === "currentWeight") return row.currentWeight === null ? "—" : `${percentFormatter.format(row.currentWeight)}%`;
    if (id === "targetBps") return `${percentFormatter.format(row.targetBps / 100)}%`;
    if (id === "differenceCents") return row.differenceCents === null ? "—" : signedMoney(row.differenceCents);
    if (id === "differencePp") return row.differencePp === null ? "—" : `${row.differencePp > 0 ? "+" : ""}${percentFormatter.format(row.differencePp)} pp`;
    if (id === "growthPercent") return row.growthPercent === null ? "—" : `${row.growthPercent > 0 ? "+" : ""}${percentFormatter.format(row.growthPercent)}%`;
    if (id === "growthCents") return signedMoney(row.growthCents);
    return "—";
  }

  function fundLabel(fund: PortfolioFund) {
    return fund.code || fund.name;
  }

  function renderCell(row: PortfolioRow, id: string) {
    const dataField = id === "code" || id === "name" || id === "investedCents" || id === "currentCents" || id === "targetBps" ? id : null;
    if (mode === "custom" && dataField) {
      const key = `${row.id}:${dataField}`;
      const draft = drafts[key];
      const textField = dataField === "code" || dataField === "name";
      return <>
        <TableCellInput
          aria-label={`${groupLabels[id] ?? id}, ${fundLabel(row)}`}
          aria-invalid={draft?.error ? true : undefined}
          aria-describedby={draft?.error ? `${key}-error` : undefined}
          align={textField ? "start" : "end"}
          numeric={!textField}
          className={dataField === "name" ? "font-medium" : dataField === "code" ? "font-mono text-xs uppercase" : ""}
          value={editValue(row, dataField)}
          title={textField ? editValue(row, dataField) : undefined}
          onFocus={() => startDraft(row, dataField)}
          onChange={(event) => { const value = event.currentTarget.value; setDrafts((current) => ({ ...current, [key]: { value } })); }}
          onBlur={(event) => { if (event.currentTarget.dataset.skipCommit) { delete event.currentTarget.dataset.skipCommit; return; } commitDraft(row, dataField); }}
          onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); commitDraft(row, dataField); event.currentTarget.dataset.skipCommit = "true"; event.currentTarget.blur(); } if (event.key === "Escape") { event.preventDefault(); cancelDraft(row, dataField); event.currentTarget.dataset.skipCommit = "true"; event.currentTarget.blur(); } }}
        />
        {draft?.error ? <span id={`${key}-error`} role="alert" className="mt-1 block max-w-48 text-start text-xs font-normal whitespace-normal text-danger-foreground">{draft.error}</span> : null}
      </>;
    }
    const display = renderValue(row, id);
    if (id === "name") return <span className="block [overflow-wrap:anywhere]">{display}</span>;
    if (id === "code") return <span className="font-mono text-xs text-secondary-foreground">{display}</span>;
    if (id === "differencePp") {
      const statusText = row.status === "overweight" ? copy.overweight : row.status === "underweight" ? copy.underweight : row.status === "balanced" ? copy.balanced : copy.unavailable;
      return <>
        <span className={row.status === "balanced" || row.status === "unavailable" ? "text-primary-foreground" : statusTone[row.status]}>{display}</span>
        <span className={`mt-0.5 flex items-center justify-end gap-1.5 text-xs ${statusTone[row.status]}`}><span aria-hidden="true" className="size-1.5 rounded-full bg-current" />{statusText}</span>
      </>;
    }
    if (id === "growthPercent" || id === "growthCents") return <span className={row.growthCents > 0 ? "text-positive-foreground" : row.growthCents < 0 ? "text-danger-foreground" : ""}>{display}</span>;
    return display;
  }

  function renderFooterCell(id: string) {
    const { totals } = computed;
    if (id === "name") return copy.totals;
    if (id === "investedCents") return formatter.format(totals.investedCents / 100);
    if (id === "currentCents") return formatter.format(totals.currentCents / 100);
    if (id === "currentWeight") return totals.currentCents ? `${percentFormatter.format(100)}%` : "—";
    if (id === "targetBps") return <span className={allocationComplete ? "" : "text-warning-foreground"}>{targetSumText}</span>;
    if (id === "growthPercent") return totals.growthPercent === null ? "—" : `${totals.growthPercent > 0 ? "+" : ""}${percentFormatter.format(totals.growthPercent)}%`;
    if (id === "growthCents") return <span className={totals.growthCents > 0 ? "text-positive-foreground" : totals.growthCents < 0 ? "text-danger-foreground" : ""}>{signedMoney(totals.growthCents)}</span>;
    if (id === "code") return null;
    return <span className="text-tertiary-foreground">—</span>;
  }

  function editValue(fund: PortfolioFund, field: "code" | "name" | "investedCents" | "currentCents" | "targetBps") {
    const key = `${fund.id}:${field}`;
    const draft = drafts[key];
    if (draft) return draft.value;
    if (field === "investedCents" || field === "currentCents") return formatCentsForInput(fund[field]);
    if (field === "targetBps") return formatBpsForInput(fund.targetBps);
    return fund[field];
  }

  function startDraft(fund: PortfolioFund, field: "code" | "name" | "investedCents" | "currentCents" | "targetBps") {
    const key = `${fund.id}:${field}`;
    setDrafts((current) => current[key] ? current : { ...current, [key]: { value: editValue(fund, field) } });
  }

  function commitDraft(fund: PortfolioFund, field: "code" | "name" | "investedCents" | "currentCents" | "targetBps") {
    const key = `${fund.id}:${field}`;
    const draft = drafts[key];
    if (!draft) return;
    let value: string | number = draft.value.trim();
    let error = "";
    if (field === "code") {
      if (value && funds.some((other) => other.id !== fund.id && other.code.trim().toUpperCase() === String(value).toUpperCase())) error = copy.duplicate;
    } else if (field === "name") {
      if (!value) error = copy.nameRequired;
    } else if (field === "investedCents" || field === "currentCents") {
      const cents = parseMoneyToCents(value);
      if (cents === null) error = copy.moneyRequired;
      else value = cents;
    } else {
      const bps = parseTargetToBps(value);
      if (bps === null) error = copy.targetRequired;
      else value = bps;
    }
    if (error) {
      setDrafts((current) => ({ ...current, [key]: { ...draft, error } }));
      return;
    }
    const committedValue = field === "code" ? String(value).toUpperCase() : value;
    setFunds((current) => current.map((item) => item.id === fund.id ? { ...item, [field]: committedValue } : item));
    setDrafts((current) => { const next = { ...current }; delete next[key]; return next; });
  }

  function cancelDraft(fund: PortfolioFund, field: string) {
    const key = `${fund.id}:${field}`;
    setDrafts((current) => { const next = { ...current }; delete next[key]; return next; });
  }

  function updateAddField(field: keyof AddDraft, value: string) {
    setAddErrorAnnouncement("");
    setAddDraft((current) => ({ ...current, [field]: value }));
    setAddErrors((current) => {
      if (!current[field]) return current;
      const next = { ...current };
      delete next[field];
      return next;
    });
  }

  function closeAddForm() {
    setShowAdd(false);
    setAddErrorAnnouncement("");
    addTriggerRef.current?.focus();
  }

  function addFund(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const code = addDraft.code.trim().toUpperCase();
    const name = addDraft.name.trim();
    const investedCents = parseMoneyToCents(addDraft.invested);
    const currentCents = parseMoneyToCents(addDraft.current);
    const targetBps = parseTargetToBps(addDraft.target);
    const errors: Partial<Record<keyof AddDraft, string>> = {};
    if (!name) errors.name = copy.nameRequired;
    if (investedCents === null) errors.invested = copy.moneyRequired;
    if (currentCents === null) errors.current = copy.moneyRequired;
    if (targetBps === null) errors.target = copy.targetRequired;
    if (code && mode !== "sample" && funds.some((fund) => fund.code.trim().toUpperCase() === code)) errors.code = copy.duplicate;
    if (!name || investedCents === null || currentCents === null || targetBps === null || errors.code) {
      setAddErrors(errors);
      const firstInvalid = (["code", "name", "invested", "current", "target"] as const).find((field) => errors[field]);
      if (firstInvalid) {
        const input = addInputRefs.current[firstInvalid];
        if (input === document.activeElement) {
          const label = { code: copy.addCode, name: copy.addName, invested: copy.addInvested, current: copy.addCurrent, target: copy.addTarget }[firstInvalid];
          setAddErrorAnnouncement(`${label}: ${errors[firstInvalid]}`);
        } else {
          setAddErrorAnnouncement("");
          input?.focus();
        }
      }
      return;
    }
    const newFund = { id: newId(), code, name, investedCents, currentCents, targetBps };
    if (mode === "sample") setFunds([newFund]);
    else setFunds((current) => [...current, newFund]);
    setMode("custom");
    setAddDraft(emptyAdd);
    setAddErrors({});
    closeAddForm();
  }

  function downloadPortfolioBackup() {
    const blob = new Blob([JSON.stringify({ version: 2, mode, funds }, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "portfolio-backup.json";
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
  }

  const allocationComplete = computed.totals.targetBps === 10_000;
  const targetSumText = `${percentFormatter.format(computed.totals.targetBps / 100)}%`;
  const remainder = Math.abs(computed.targetDifferenceBps / 100);
  const differenceDirection = computed.targetDifferenceBps > 0 ? copy.below : copy.above;

  return <div className="flex min-h-svh flex-col bg-page text-primary-foreground">
    <Header locale={locale} languageLabel={languageLabel} themeLabel={themeLabel} stale={false} staleText="" onBeforeLanguageChange={() => ({ status: "saved" })} submitting={false} languageHandoffText={{ pending: "", storage: "" }} />
    <main id="main-content" tabIndex={-1} className="@container/portfolio w-full min-w-0 flex-1 px-4 py-8 focus-visible:outline-none">
      <header className="mb-7">
        <h1 className="font-display text-heading-6 font-normal sm:text-heading-5">{copy.title}</h1>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button ref={addTriggerRef} onClick={() => { setShowAdd((value) => !value); setAddErrors({}); setAddErrorAnnouncement(""); }} variant="outline">{copy.addFund}</Button>
        {mode === "custom" && funds.length === 0 ? <Button onClick={() => { setFunds(SAMPLE_FUNDS); setMode("sample"); setDeleted(null); }} variant="secondary">{copy.loadDemo}</Button> : null}
        <span role="status" aria-live="polite" className="text-sm text-danger-foreground">{storageUnavailable ? copy.storageUnavailable : ""}</span>
        {storageUnavailable ? <Button onClick={downloadPortfolioBackup} size="xs" variant="outline">{copy.downloadBackup}</Button> : null}
      </div>

      {mode === "sample" ? <p className="mb-4 text-sm text-secondary-foreground" role="note">{copy.sampleNotice}</p> : null}

      {showAdd ? <form onSubmit={addFund} className="mb-6 grid grid-cols-[repeat(auto-fit,minmax(min(100%,14rem),1fr))] gap-x-4 gap-y-1 rounded-lg bg-sunken p-4" noValidate>
        {([ ["code", copy.addCode], ["name", copy.addName], ["invested", copy.addInvested], ["current", copy.addCurrent], ["target", copy.addTarget] ] as const).map(([key, label]) => <label key={key} className="row-span-3 mb-3 grid min-w-0 grid-rows-subgrid text-sm font-medium">
          <span>{label}</span>{key === "code" || key === "name" ? <Input ref={(node) => { addInputRefs.current[key] = node; }} aria-label={label} aria-invalid={addErrors[key] ? true : undefined} aria-describedby={addErrors[key] ? `add-${key}-error` : undefined} className="min-h-10 w-full rounded-md border border-control-border bg-container px-3 py-2 font-normal" value={addDraft[key]} onChange={(event) => updateAddField(key, event.currentTarget.value)} /> : <DecimalInput ref={(node) => { addInputRefs.current[key] = node; }} aria-label={label} aria-invalid={addErrors[key] ? true : undefined} aria-describedby={addErrors[key] ? `add-${key}-error` : undefined} className="min-h-10 w-full rounded-md border border-control-border bg-container px-3 py-2 font-normal tabular-nums" value={addDraft[key]} onChange={(event) => updateAddField(key, event.currentTarget.value)} />}{addErrors[key] ? <span id={`add-${key}-error`} className="text-xs text-danger-foreground">{addErrors[key]}</span> : null}
        </label>)}
        <span role="status" aria-live="polite" className="sr-only">{addErrorAnnouncement}</span>
        <div className="col-span-full flex flex-wrap items-end gap-3"><Button type="submit">{copy.addFund}</Button><Button onClick={() => { setAddErrors({}); closeAddForm(); }} variant="ghost">{copy.cancel}</Button></div>
      </form> : null}

      {funds.length === 0 ? <TableEmpty>{copy.empty}</TableEmpty> : <>
        <DataTable
          table={table}
          id="portfolio"
          label={locale === "es" ? "Tabla de cartera" : "Portfolio table"}
          caption={locale === "es" ? "Cartera de fondos y objetivos de asignación" : "Fund portfolio and target allocations"}
          className="max-h-[70dvh]"
          tableClassName="min-w-[64rem]"
          headerLabel={(id) => groupLabels[id]}
          headerHint={(id) => id === "differenceCents" ? `${copy.overweightHelp} ${copy.underweightHelp}` : id === "differencePp" ? copy.ppHelp : undefined}
          renderCell={(cell) => renderCell(cell.row.original, cell.column.id)}
          renderFooterCell={renderFooterCell}
          trailingColumn={mode === "custom" ? {
            id: "actions",
            header: copy.actions,
            cell: (tableRow) => {
              const row = tableRow.original;
              return <Button aria-label={`${copy.delete} ${fundLabel(row)}`} onClick={() => { if (window.confirm(copy.deleteConfirm)) { setDeleted(row); setFunds((current) => current.filter((fund) => fund.id !== row.id)); } }} size="icon-sm" variant="ghost" className="text-secondary-foreground hover:text-danger-foreground">
                <svg aria-hidden="true" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M2.5 4.5h11M6.5 4.5V3a1 1 0 0 1 1-1h1a1 1 0 0 1 1 1v1.5m-6 0 .6 8.6a1 1 0 0 0 1 .9h4.8a1 1 0 0 0 1-.9l.6-8.6" /></svg>
              </Button>;
            },
          } : undefined}
        />
        {!allocationComplete ? <p className="mt-3 text-sm tabular-nums text-warning-foreground">{copy.allocationIncomplete.replace("{amount}", percentFormatter.format(remainder)).replace("{direction}", differenceDirection)}</p> : null}
        <section aria-labelledby="portfolio-distribution-title" className="@container/allocation mt-8 w-full min-w-0">
          <div className="mb-5 flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
            <h2 id="portfolio-distribution-title" className="text-lg font-semibold">{copy.distribution}</h2>
            <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-secondary-foreground">
              <span className="inline-flex items-center gap-2"><span aria-hidden="true" className="h-2 w-5 rounded-sm bg-brand-solid" />{copy.currentAllocation}</span>
              <span className="inline-flex items-center gap-2"><span aria-hidden="true" className="h-4 border-s-2 border-primary-foreground" />{copy.targetAllocation}</span>
            </div>
          </div>
          <ul className="space-y-6">{computed.rows.map((row) => <li key={row.id} className="grid min-w-0 grid-cols-[minmax(0,1fr)] items-center gap-x-4 gap-y-2 text-sm @2xl/allocation:grid-cols-[minmax(0,14rem)_minmax(0,1fr)_auto]">
            <span className="min-w-0 [overflow-wrap:anywhere]">{row.name}</span>
            <div className="relative h-3 rounded-sm bg-component" role="img" aria-label={`${row.name}: ${copy.currentLabel.replace("{value}", row.currentWeight === null ? "—" : percentFormatter.format(row.currentWeight))}, ${copy.targetLabel.replace("{value}", percentFormatter.format(row.targetBps / 100))}`}>
              <div className="absolute inset-y-0 start-0 rounded-sm bg-brand-solid" style={{ width: `${Math.max(0, Math.min(100, row.currentWeight ?? 0))}%` }} />
              <span className="absolute -top-1 h-5 border-s-2 border-primary-foreground" style={{ insetInlineStart: `clamp(0px, ${row.targetBps / 100}%, calc(100% - 2px))` }} />
            </div>
            <span className="text-end tabular-nums text-secondary-foreground">{row.currentWeight === null ? "—" : percentFormatter.format(row.currentWeight)}% / {percentFormatter.format(row.targetBps / 100)}%</span>
          </li>)}</ul>
        </section>
      </>}
      {deleted ? <p role="status" className="mt-3 flex items-center gap-2 text-sm">{fundLabel(deleted)} <Button onClick={() => { setFunds((current) => [...current, deleted]); setDeleted(null); }} size="xs" variant="outline">{copy.undo}</Button></p> : null}
    </main>
    <Footer label={locale === "es" ? "Diseñado por" : "Designed by"} />
  </div>;
}
