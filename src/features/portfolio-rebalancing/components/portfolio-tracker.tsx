"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  createColumnHelper,
  createSortedRowModel,
  rowSortingFeature,
  sortFn_basic,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import { Header } from "@/components/header";
import { Footer } from "@/components/footer";
import { Button } from "@/components/primitives/button";
import { DecimalInput } from "@/components/primitives/decimal-input";
import { Input } from "@/components/primitives/input";
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
  sortedRowModel: createSortedRowModel(),
  sortFns: { basic: sortFn_basic },
});
const columnHelper = createColumnHelper<typeof portfolioTableFeatures, PortfolioRow>();
const columns = [
  columnHelper.group({ id: "identification", header: "identification", columns: columnHelper.columns([
    columnHelper.accessor("code", { header: "code", sortFn: "basic" }),
    columnHelper.accessor("name", { header: "fund", sortFn: "basic" }),
  ]) }),
  columnHelper.group({ id: "valuation", header: "valuation", columns: columnHelper.columns([
    columnHelper.accessor("investedCents", { header: "invested", sortFn: "basic" }),
    columnHelper.accessor("currentCents", { header: "current", sortFn: "basic" }),
  ]) }),
  columnHelper.group({ id: "allocation", header: "allocation", columns: columnHelper.columns([
    columnHelper.accessor((row) => row.currentWeight, { id: "currentWeight", header: "currentWeight", sortFn: "basic" }),
    columnHelper.accessor("targetBps", { header: "targetBps", sortFn: "basic" }),
    columnHelper.accessor((row) => row.differenceCents, { id: "differenceCents", header: "differenceCents", sortFn: "basic" }),
    columnHelper.accessor((row) => row.differencePp, { id: "differencePp", header: "differencePp", sortFn: "basic" }),
  ]) }),
  columnHelper.group({ id: "return", header: "return", columns: columnHelper.columns([
    columnHelper.accessor((row) => row.growthPercent, { id: "growthPercent", header: "growthPercent", sortFn: "basic" }),
    columnHelper.accessor("growthCents", { header: "growthCents", sortFn: "basic" }),
  ]) }),
];

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
  const [showDistribution, setShowDistribution] = useState(false);
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

  const table = useTable({ features: portfolioTableFeatures, columns, data: computed.rows, getRowId: (row) => row.id }, (state) => ({ sorting: state.sorting }));
  const groupLabels: Record<string, string> = {
    identification: copy.identification, valuation: copy.valuation, allocation: copy.allocation, return: copy.return,
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
    <main id="main-content" tabIndex={-1} className="mx-auto w-full max-w-[1600px] min-w-0 flex-1 px-4 py-8 focus-visible:outline-none sm:px-6 lg:px-8">
      <header className="mb-7 border-b border-border-subtle pb-5">
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{copy.title}</h1>
      </header>

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <Button ref={addTriggerRef} onClick={() => { setShowAdd((value) => !value); setAddErrors({}); setAddErrorAnnouncement(""); }} variant="outline">{copy.addFund}</Button>
        {mode === "custom" && funds.length === 0 ? <Button onClick={() => { setFunds(SAMPLE_FUNDS); setMode("sample"); setDeleted(null); }} variant="secondary">{copy.loadDemo}</Button> : null}
        {funds.length > 0 ? <Button onClick={() => setShowDistribution((value) => !value)} variant="ghost">{showDistribution ? copy.hideDistribution : copy.distribution}</Button> : null}
        <span role="status" aria-live="polite" className="text-sm text-danger-foreground">{storageUnavailable ? copy.storageUnavailable : ""}</span>
        {storageUnavailable ? <Button onClick={downloadPortfolioBackup} size="xs" variant="outline">{copy.downloadBackup}</Button> : null}
      </div>

      {mode === "sample" ? <p className="mb-4 text-sm text-secondary-foreground" role="note">{copy.sampleNotice}</p> : null}

      {showAdd ? <form onSubmit={addFund} className="mb-5 grid grid-cols-1 gap-3 border-y border-border-subtle py-4 sm:grid-cols-2 lg:grid-cols-5" noValidate>
        {([ ["code", copy.addCode], ["name", copy.addName], ["invested", copy.addInvested], ["current", copy.addCurrent], ["target", copy.addTarget] ] as const).map(([key, label]) => <label key={key} className="grid gap-1 text-sm font-medium">
          {label}{key === "code" || key === "name" ? <Input ref={(node) => { addInputRefs.current[key] = node; }} aria-label={label} aria-invalid={addErrors[key] ? true : undefined} aria-describedby={addErrors[key] ? `add-${key}-error` : undefined} className="min-h-10 w-full rounded-md border border-control-border bg-container px-3 py-2 font-normal" value={addDraft[key]} onChange={(event) => updateAddField(key, event.currentTarget.value)} /> : <DecimalInput ref={(node) => { addInputRefs.current[key] = node; }} aria-label={label} aria-invalid={addErrors[key] ? true : undefined} aria-describedby={addErrors[key] ? `add-${key}-error` : undefined} className="min-h-10 w-full rounded-md border border-control-border bg-container px-3 py-2 font-normal tabular-nums" value={addDraft[key]} onChange={(event) => updateAddField(key, event.currentTarget.value)} />}{addErrors[key] ? <span id={`add-${key}-error`} className="text-xs text-danger-foreground">{addErrors[key]}</span> : null}
        </label>)}
        <span role="status" aria-live="polite" className="sr-only">{addErrorAnnouncement}</span>
        <div className="flex items-end gap-2 sm:col-span-2 lg:col-span-5"><Button type="submit">{copy.addFund}</Button><Button onClick={() => { setAddErrors({}); closeAddForm(); }} variant="ghost">{copy.cancel}</Button></div>
      </form> : null}

      {funds.length === 0 ? <p className="border-y border-border-subtle py-10 text-center text-secondary-foreground">{copy.empty}</p> : <>
        {showDistribution ? <section aria-label={copy.distribution} className="mb-5 border-b border-border-subtle pb-4">
          <ul className="space-y-3">{computed.rows.map((row) => <li key={row.id} className="grid grid-cols-[minmax(9rem,14rem)_minmax(8rem,1fr)_auto] items-center gap-3 text-sm">
            <span className="truncate">{row.name}</span>
            <div className="relative h-3 rounded-sm bg-component" role="img" aria-label={`${row.name}: ${copy.currentLabel.replace("{value}", row.currentWeight === null ? "—" : percentFormatter.format(row.currentWeight))}, ${copy.targetLabel.replace("{value}", percentFormatter.format(row.targetBps / 100))}`}>
              <div className="absolute inset-y-0 start-0 rounded-sm bg-brand-solid" style={{ width: `${Math.max(0, Math.min(100, row.currentWeight ?? 0))}%` }} />
              <span className="absolute -top-1 h-5 border-s-2 border-primary-foreground" style={{ left: `${row.targetBps / 100}%` }} />
            </div>
            <span className="tabular-nums text-secondary-foreground">{row.currentWeight === null ? "—" : percentFormatter.format(row.currentWeight)}% / {percentFormatter.format(row.targetBps / 100)}%</span>
          </li>)}</ul>
        </section> : null}

        <div className="max-h-[70vh] max-w-full contain-paint overflow-auto overscroll-contain border-y border-border-subtle" role="region" aria-label={locale === "es" ? "Tabla de cartera; desplázate horizontalmente para ver todas las columnas" : "Portfolio table; scroll horizontally to see all columns"} tabIndex={0}>
          <table className="w-full min-w-[1380px] border-collapse text-sm">
            <caption className="sr-only">{locale === "es" ? "Cartera de fondos y objetivos de asignación" : "Fund portfolio and target allocations"}</caption>
            <thead>
              {table.getHeaderGroups().map((group) => <tr key={group.id}>
                {group.headers.map((header) => {
                  if (header.isPlaceholder) return null;
                  const isGroup = header.subHeaders.length > 0;
                  const id = header.column.id;
                  const activeSort = table.state.sorting.find((sort) => sort.id === id);
                  const sortState = activeSort ? (activeSort.desc ? "desc" : "asc") : false;
                  const label = groupLabels[id] ?? id;
                  const helpText = id === "differenceCents" ? `${copy.overweightHelp} ${copy.underweightHelp}` : id === "differencePp" ? copy.ppHelp : undefined;
                  const helpId = helpText ? `portfolio-help-${id}` : undefined;
                  if (isGroup) return <th key={header.id} id={`portfolio-header-${id}`} colSpan={header.colSpan} scope="colgroup" className="border-b border-border-strong bg-sunken px-3 py-2 text-start text-xs font-semibold uppercase tracking-wide text-secondary-foreground">{label}</th>;
                  const sortable = header.column.getCanSort();
                  return <th key={header.id} id={`portfolio-header-${id}`} rowSpan={header.rowSpan} scope="col" aria-sort={sortState === "asc" ? "ascending" : sortState === "desc" ? "descending" : "none"} className={`border-b border-border-strong px-3 py-2 font-medium ${["code", "name"].includes(id) ? "text-start" : "text-end"} ${id === "code" ? "sticky start-0 z-20 border-e border-border-subtle bg-page" : ""}`} >
                    {sortable ? <button aria-describedby={helpId} className="inline-flex min-h-8 items-center gap-1 rounded-sm text-inherit hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-border-focus" onClick={header.column.getToggleSortingHandler()} type="button">{label}<span aria-hidden="true">{sortState === "asc" ? "↑" : sortState === "desc" ? "↓" : "↕"}</span></button> : label}
                    {helpText ? <span aria-hidden="true" className="ms-1 inline-flex cursor-help" title={helpText}><svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6.25" /><path d="M8 7v4m0-6h.01" /></svg></span> : null}
                    {helpText ? <span id={helpId} className="sr-only">{helpText}</span> : null}
                  </th>;
                })}
                {group.depth === 0 && mode === "custom" ? <th id="portfolio-header-actions" rowSpan={2} scope="col" className="border-b border-border-strong px-3 py-2 text-end font-medium">{copy.actions}</th> : null}
              </tr>)}
            </thead>
            <tbody>
              {table.getRowModel().rows.map((tableRow) => {
                const row = tableRow.original;
                const statusText = row.status === "overweight" ? copy.overweight : row.status === "underweight" ? copy.underweight : row.status === "balanced" ? copy.balanced : copy.unavailable;
                return <tr key={row.id} className="border-b border-border-subtle align-middle last:border-b-0">
                  {tableRow.getAllCells().map((cell) => {
                    const id = cell.column.id;
                    const identity = id === "code" || id === "name";
                    // Column ids are the stable field keys declared by the table helper.
                    const editable = mode === "custom" && ["code", "name", "investedCents", "currentCents", "targetBps"].includes(id);
                    const dataField = (id === "investedCents" || id === "currentCents" || id === "targetBps" || id === "code" || id === "name") ? id : null;
                    const display = renderValue(row, id);
                    const group = id === "code" || id === "name" ? "identification" : id === "investedCents" || id === "currentCents" ? "valuation" : id === "currentWeight" || id === "targetBps" || id === "differenceCents" || id === "differencePp" ? "allocation" : "return";
                    if (editable && dataField) {
                      const DraftInput = identity ? Input : DecimalInput;
                      const key = `${row.id}:${dataField}`;
                      const draft = drafts[key];
                      const fieldLabel = groupLabels[id] ?? id;
                      return <td key={cell.id} headers={`portfolio-header-${group} portfolio-header-${id}`} className={`px-3 py-2 ${identity ? "text-start" : "text-end tabular-nums"} ${id === "code" ? "sticky start-0 z-10 border-e border-border-subtle bg-container" : ""}`}>
                        <DraftInput aria-label={`${fieldLabel}, ${row.code}`} aria-invalid={Boolean(draft?.error)} aria-describedby={draft?.error ? `${key}-error` : undefined} className={`min-h-9 w-full rounded-sm border border-transparent bg-transparent px-2 py-1 text-inherit tabular-nums hover:border-border-default focus:border-control-border focus:bg-container ${identity ? "text-start" : "text-end"}`} value={editValue(row, dataField)} onFocus={() => startDraft(row, dataField)} onChange={(event) => { const value = event.currentTarget.value; setDrafts((current) => ({ ...current, [key]: { value } })); }} onBlur={(event) => { if (event.currentTarget.dataset.skipCommit) { delete event.currentTarget.dataset.skipCommit; return; } commitDraft(row, dataField); }} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); commitDraft(row, dataField); event.currentTarget.dataset.skipCommit = "true"; event.currentTarget.blur(); } if (event.key === "Escape") { event.preventDefault(); cancelDraft(row, dataField); event.currentTarget.dataset.skipCommit = "true"; event.currentTarget.blur(); } }} />
                        {draft?.error ? <span id={`${key}-error`} role="alert" className="block max-w-40 text-start text-xs text-danger-foreground">{draft.error}</span> : null}
                      </td>;
                    }
                    return <td key={cell.id} headers={`portfolio-header-${group} portfolio-header-${id}`} className={`px-3 py-2 ${identity ? "text-start" : "text-end tabular-nums"}`}>
                      {id === "differencePp" ? <><span className={row.status === "overweight" ? "text-warning-foreground" : row.status === "underweight" ? "text-brand-foreground" : "text-primary-foreground"}>{display}</span><span className={`mt-0.5 block text-xs ${row.status === "overweight" ? "text-warning-foreground" : row.status === "underweight" ? "text-brand-foreground" : "text-secondary-foreground"}`}>{statusText}</span></> : id === "growthPercent" || id === "growthCents" ? <span className={row.growthCents > 0 ? "text-positive-foreground" : row.growthCents < 0 ? "text-danger-foreground" : ""}>{display}</span> : display}
                    </td>;
                  })}
                  {mode === "custom" ? <td headers="portfolio-header-actions" className="px-2 py-2 text-end"><Button aria-label={`${copy.delete} ${row.code}`} onClick={() => { if (window.confirm(copy.deleteConfirm)) { setDeleted(row); setFunds((current) => current.filter((fund) => fund.id !== row.id)); } }} size="icon-xs" variant="ghost">×</Button></td> : null}
                </tr>;
              })}
            </tbody>
            <tfoot className="sticky bottom-0 z-10 bg-container font-semibold">
              <tr className="border-t-2 border-border-strong">
                <th colSpan={2} scope="row" className="px-3 py-3 text-start">{copy.totals}</th>
                <td className="px-3 py-3 text-end tabular-nums">{formatter.format(computed.totals.investedCents / 100)}</td>
                <td className="px-3 py-3 text-end tabular-nums">{formatter.format(computed.totals.currentCents / 100)}</td>
                <td className="px-3 py-3 text-end tabular-nums">{computed.totals.currentCents ? "100.00%" : "—"}</td>
                <td className="px-3 py-3 text-end tabular-nums">{targetSumText}</td>
                <td className="px-3 py-3 text-end">—</td><td className="px-3 py-3 text-end">—</td>
                <td className="px-3 py-3 text-end tabular-nums">{computed.totals.growthPercent === null ? "—" : `${computed.totals.growthPercent > 0 ? "+" : ""}${percentFormatter.format(computed.totals.growthPercent)}%`}</td>
                <td className={`px-3 py-3 text-end tabular-nums ${computed.totals.growthCents > 0 ? "text-positive-foreground" : computed.totals.growthCents < 0 ? "text-danger-foreground" : ""}`}>{signedMoney(computed.totals.growthCents)}</td>
                {mode === "custom" ? <td /> : null}
              </tr>
            </tfoot>
          </table>
        </div>
        {!allocationComplete ? <p className="mt-3 text-sm tabular-nums text-warning-foreground">{copy.allocationIncomplete.replace("{amount}", percentFormatter.format(remainder)).replace("{direction}", differenceDirection)}</p> : null}
      </>}
      {deleted ? <p role="status" className="mt-3 flex items-center gap-2 text-sm">{deleted.code} <Button onClick={() => { setFunds((current) => [...current, deleted]); setDeleted(null); }} size="xs" variant="outline">{copy.undo}</Button></p> : null}
    </main>
    <Footer label={locale === "es" ? "Diseñado por" : "Designed by"} />
  </div>;
}
