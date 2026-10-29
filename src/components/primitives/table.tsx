import type { ComponentProps, ReactNode } from "react";

type TableAlign = "start" | "center" | "end";
type TableSortDirection = "asc" | "desc" | false;

const alignClasses: Record<TableAlign, string> = {
  start: "text-start",
  center: "text-center",
  end: "text-end",
};

// Sticky cells sit above scrolling cells and keep an opaque background so content
// does not bleed through. The edge rule marks where the frozen column ends.
const stickyStartClasses = "sticky start-0 border-e border-e-border-default";

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

type TableContainerProps = ComponentProps<"div"> & {
  /** Accessible name for the scrollable region, announced to keyboard and screen reader users. */
  label: string;
};

function TableContainer({ label, className = "", ...props }: TableContainerProps) {
  return (
    <div
      data-slot="table-container"
      role="region"
      aria-label={label}
      tabIndex={0}
      className={cx(
        "relative max-w-full overflow-auto overscroll-contain rounded-xl border border-border-default bg-container shadow-default contain-paint",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-border-focus",
        className,
      )}
      {...props}
    />
  );
}

function Table({ className = "", ...props }: ComponentProps<"table">) {
  return (
    <table
      data-slot="table"
      // `border-separate` keeps borders attached to sticky cells; collapsed borders scroll away.
      className={cx("w-full border-separate border-spacing-0 text-sm text-primary-foreground", className)}
      {...props}
    />
  );
}

function TableCaption({ className = "", ...props }: ComponentProps<"caption">) {
  return <caption data-slot="table-caption" className={cx("sr-only", className)} {...props} />;
}

function TableHeader({ sticky = true, className = "", ...props }: ComponentProps<"thead"> & { sticky?: boolean }) {
  return (
    <thead
      data-slot="table-header"
      className={cx(sticky && "sticky top-0 z-20", "[&_th]:bg-sunken", className)}
      {...props}
    />
  );
}

function TableBody({ className = "", ...props }: ComponentProps<"tbody">) {
  return (
    <tbody
      data-slot="table-body"
      className={cx("[&>tr:last-child>*]:border-b-0", className)}
      {...props}
    />
  );
}

function TableFooter({ sticky = true, className = "", ...props }: ComponentProps<"tfoot"> & { sticky?: boolean }) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cx(
        sticky && "sticky bottom-0 z-20",
        "[&_td]:bg-sunken [&_th]:bg-sunken [&_tr>*]:border-t [&_tr>*]:border-b-0 [&_tr>*]:border-t-border-strong [&_tr>*]:font-semibold",
        className,
      )}
      {...props}
    />
  );
}

function TableRow({ className = "", ...props }: ComponentProps<"tr">) {
  return (
    <tr
      data-slot="table-row"
      className={cx(
        "group/row align-middle",
        // Cells own the background so sticky cells follow the row hover state.
        "[&>td]:bg-container [&>th]:bg-container hover:[&>td]:bg-card hover:[&>th]:bg-card",
        className,
      )}
      {...props}
    />
  );
}

type TableCellLayoutProps = {
  align?: TableAlign;
  /** Freeze the cell at the inline-start edge while the table scrolls horizontally. */
  sticky?: boolean;
  /** Draw a divider at the inline-start edge to separate column groups. */
  divider?: boolean;
  numeric?: boolean;
};

function cellLayoutClasses({ align = "start", sticky, divider, numeric }: TableCellLayoutProps) {
  return cx(
    alignClasses[align],
    numeric && "tabular-nums whitespace-nowrap",
    divider && "border-s border-s-border-subtle",
    sticky && stickyStartClasses,
  );
}

type TableHeadProps = Omit<ComponentProps<"th">, "align"> &
  TableCellLayoutProps & {
    /** `group` renders the band above a set of related columns. */
    variant?: "column" | "group";
  };

function TableHead({
  align = "start",
  sticky,
  divider,
  numeric,
  variant = "column",
  className = "",
  ...props
}: TableHeadProps) {
  return (
    <th
      data-slot="table-head"
      data-variant={variant}
      className={cx(
        "border-b border-b-border-default px-3 align-bottom whitespace-nowrap",
        variant === "group"
          ? "pt-2.5 pb-1.5 text-[0.6875rem] font-semibold tracking-[0.08em] text-tertiary-foreground uppercase"
          : "py-2 text-xs font-medium text-secondary-foreground",
        cellLayoutClasses({ align, sticky, divider, numeric }),
        sticky && "z-10",
        className,
      )}
      {...props}
    />
  );
}

type TableCellProps = Omit<ComponentProps<"td">, "align"> & TableCellLayoutProps;

function TableCell({ align = "start", sticky, divider, numeric, className = "", ...props }: TableCellProps) {
  return (
    <td
      data-slot="table-cell"
      className={cx(
        "border-b border-b-border-subtle px-3 py-2.5 transition-colors",
        cellLayoutClasses({ align, sticky, divider, numeric }),
        sticky && "z-10",
        className,
      )}
      {...props}
    />
  );
}

/** A body cell that names its row, e.g. the fund name. Renders a `th[scope=row]`. */
function TableRowHeader({ align = "start", sticky, divider, numeric, className = "", ...props }: Omit<ComponentProps<"th">, "align"> & TableCellLayoutProps) {
  return (
    <th
      data-slot="table-row-header"
      scope="row"
      className={cx(
        "border-b border-b-border-subtle px-3 py-2.5 font-medium transition-colors",
        cellLayoutClasses({ align, sticky, divider, numeric }),
        sticky && "z-10",
        className,
      )}
      {...props}
    />
  );
}

function SortIcon({ direction }: { direction: TableSortDirection }) {
  return (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="size-3.5 shrink-0">
      {direction === "asc" ? <path d="M8 12.5v-9m-3.5 3.5L8 3.5 11.5 7" /> : null}
      {direction === "desc" ? <path d="M8 3.5v9m-3.5-3.5L8 12.5 11.5 9" /> : null}
      {direction === false ? <path d="m5 6 3-3 3 3m-6 4 3 3 3-3" /> : null}
    </svg>
  );
}

type TableSortButtonProps = Omit<ComponentProps<"button">, "children"> & {
  children: ReactNode;
  direction: TableSortDirection;
  align?: TableAlign;
};

/**
 * Header button that toggles sorting. The idle indicator only appears on hover or
 * keyboard focus for devices that can hover, so narrow touch layouts stay clean;
 * the active direction is always shown.
 */
function TableSortButton({ children, direction, align = "start", className = "", type = "button", ...props }: TableSortButtonProps) {
  return (
    <button
      data-slot="table-sort-button"
      type={type}
      className={cx(
        "group/sort -mx-1.5 inline-flex min-h-8 cursor-pointer items-center gap-1 rounded-sm px-1.5 whitespace-nowrap text-inherit transition-colors",
        "hover:bg-transparent-hover hover:text-primary-foreground focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-border-focus",
        direction && "text-primary-foreground",
        align === "end" && "flex-row-reverse",
        className,
      )}
      {...props}
    >
      <span>{children}</span>
      <span
        aria-hidden="true"
        className={cx(
          "inline-flex",
          direction
            ? "text-brand-foreground"
            : "hidden text-tertiary-foreground opacity-0 transition-opacity [@media(hover:hover)]:inline-flex group-hover/sort:opacity-100 group-focus-visible/sort:opacity-100",
        )}
      >
        <SortIcon direction={direction} />
      </span>
    </button>
  );
}

type TableHeaderHintProps = {
  id: string;
  children: string;
};

/** Info glyph with a hover tooltip; the text is also exposed to assistive tech via `id`. */
function TableHeaderHint({ id, children }: TableHeaderHintProps) {
  return (
    <>
      <span aria-hidden="true" className="ms-1 inline-flex cursor-help align-middle text-tertiary-foreground" title={children}>
        <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.5">
          <circle cx="8" cy="8" r="6.25" />
          <path d="M8 7v4m0-6h.01" />
        </svg>
      </span>
      <span id={id} className="sr-only">{children}</span>
    </>
  );
}

type TableCellInputProps = Omit<ComponentProps<"input">, "type"> & {
  align?: TableAlign;
  /** Opens the decimal keypad on touch devices. */
  numeric?: boolean;
};

/** Borderless input that edits a value in place; it reveals its frame on hover and focus. */
function TableCellInput({ align = "start", numeric = false, className = "", ...props }: TableCellInputProps) {
  return (
    <input
      data-slot="table-cell-input"
      type="text"
      inputMode={numeric ? "decimal" : undefined}
      className={cx(
        "-mx-2 h-9 w-[calc(100%+1rem)] min-w-0 rounded-md border border-transparent bg-transparent px-2 text-base text-inherit sm:text-sm transition-colors",
        "hover:border-border-default hover:bg-container focus-visible:border-brand-border-focus focus-visible:bg-container focus-visible:ring-2 focus-visible:ring-brand-border-focus/30 focus-visible:outline-none",
        "aria-invalid:border-danger-border-default aria-invalid:bg-danger-subtle",
        numeric && "tabular-nums",
        alignClasses[align],
        className,
      )}
      {...props}
    />
  );
}

function TableEmpty({ className = "", ...props }: ComponentProps<"div">) {
  return (
    <div
      data-slot="table-empty"
      className={cx(
        "rounded-xl border border-dashed border-border-default bg-container px-6 py-12 text-center text-sm text-secondary-foreground",
        className,
      )}
      {...props}
    />
  );
}

export {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableCellInput,
  TableContainer,
  TableEmpty,
  TableFooter,
  TableHead,
  TableHeader,
  TableHeaderHint,
  TableRow,
  TableRowHeader,
  TableSortButton,
};
export type { TableAlign, TableCellInputProps, TableSortDirection };
