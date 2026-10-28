"use client";

import type { ReactNode } from "react";
import {
  flexRender,
  type Cell,
  type Column,
  type Header,
  type ReactTable,
  type Row,
  type RowData,
  type TableFeatures,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableContainer,
  TableFooter,
  TableHead,
  TableHeader,
  TableHeaderHint,
  TableRow,
  TableRowHeader,
  TableSortButton,
  type TableAlign,
  type TableSortDirection,
} from "@/components/primitives/table";

/**
 * Presentation hints read from `columnDef.meta`. Declare them on the table's
 * features with `columnMeta: metaHelper<DataTableColumnMeta>()` to type them.
 */
type DataTableColumnMeta = {
  align?: TableAlign;
  /** Use tabular figures so digits line up across rows. */
  numeric?: boolean;
  /** Freeze the column at the inline-start edge. Use it on the first visible column. */
  sticky?: boolean;
  /** Render body cells as `th[scope=row]` so the column names its row. */
  rowHeader?: boolean;
  /** Extra classes for every cell in the column, e.g. a minimum width. */
  className?: string;
};

type AnyColumn = Column<TableFeatures, RowData, unknown>;

type DataTableTrailingColumn<TFeatures extends TableFeatures, TData extends RowData> = {
  id: string;
  header: ReactNode;
  cell: (row: Row<TFeatures, TData>) => ReactNode;
};

type DataTableProps<TFeatures extends TableFeatures, TData extends RowData> = {
  table: ReactTable<TFeatures, TData, unknown>;
  /** Prefix for generated element ids; must be unique on the page. */
  id: string;
  /** Accessible name of the scrollable region. */
  label: string;
  caption: ReactNode;
  describedBy?: string;
  className?: string;
  tableClassName?: string;
  /** Header text for a column or column group id. Defaults to the column definition's header. */
  headerLabel?: (columnId: string) => ReactNode;
  /** Optional explanation shown as a tooltip and announced with the header. */
  headerHint?: (columnId: string) => string | undefined;
  /** Cell content. Defaults to the column definition's `cell`. */
  renderCell?: (cell: Cell<TFeatures, TData, unknown>) => ReactNode;
  /** Footer content per leaf column id. When omitted, no footer row is rendered. */
  renderFooterCell?: (columnId: string) => ReactNode;
  /** Extra column appended after the data columns, e.g. row actions. */
  trailingColumn?: DataTableTrailingColumn<TFeatures, TData>;
};

function getMeta(column: AnyColumn): DataTableColumnMeta {
  return (column.columnDef.meta ?? {}) as DataTableColumnMeta;
}

function isVisible(column: AnyColumn) {
  const visibility = column as AnyColumn & { getIsVisible?: () => boolean };
  return visibility.getIsVisible?.() ?? true;
}

/** True for the first visible leaf of a column group, where a divider separates groups. */
function startsGroup(column: AnyColumn) {
  const parent = column.parent;
  if (!parent) return false;
  return parent.columns.find(isVisible)?.id === column.id;
}

function getSort(column: AnyColumn) {
  const sorting = column as AnyColumn & {
    getCanSort?: () => boolean;
    getIsSorted?: () => TableSortDirection;
    getToggleSortingHandler?: () => ((event: unknown) => void) | undefined;
  };
  if (!sorting.getCanSort?.()) return null;
  return {
    direction: sorting.getIsSorted?.() ?? false,
    toggle: sorting.getToggleSortingHandler?.(),
  };
}

function ariaSort(direction: TableSortDirection) {
  return direction === "asc" ? "ascending" : direction === "desc" ? "descending" : "none";
}

function DataTable<TFeatures extends TableFeatures, TData extends RowData>({
  table,
  id,
  label,
  caption,
  describedBy,
  className,
  tableClassName,
  headerLabel,
  headerHint,
  renderCell,
  renderFooterCell,
  trailingColumn,
}: DataTableProps<TFeatures, TData>) {
  const headerId = (columnId: string) => `${id}-header-${columnId}`;
  const headerGroups = table.getHeaderGroups();
  const visibleTable = table as typeof table & { getVisibleLeafColumns?: () => AnyColumn[] };
  const leafColumns = visibleTable.getVisibleLeafColumns?.() ?? (table.getAllLeafColumns() as unknown as AnyColumn[]);

  function labelFor(header: Header<TFeatures, TData, unknown>) {
    const custom = headerLabel?.(header.column.id);
    if (custom !== undefined) return custom;
    return flexRender(header.column.columnDef.header, header.getContext());
  }

  function renderHeader(header: Header<TFeatures, TData, unknown>) {
    // Leaf columns without a group span every header row; their lower slots have rowSpan 0.
    if (header.rowSpan === 0) return null;
    const column = header.column as unknown as AnyColumn;
    const content = labelFor(header);

    if (header.subHeaders.length > 0 && !header.isPlaceholder) {
      return (
        <TableHead key={header.id} id={headerId(column.id)} colSpan={header.colSpan} scope="colgroup" variant="group" divider>
          {content}
        </TableHead>
      );
    }

    const meta = getMeta(column);
    const align = meta.align ?? "start";
    const sort = getSort(column);
    const hint = headerHint?.(column.id);
    const hintId = hint ? `${id}-help-${column.id}` : undefined;

    return (
      <TableHead
        key={header.id}
        id={headerId(column.id)}
        rowSpan={header.rowSpan}
        scope="col"
        align={align}
        sticky={meta.sticky}
        divider={startsGroup(column)}
        className={meta.className}
        aria-sort={sort ? ariaSort(sort.direction) : undefined}
      >
        {sort ? (
          <TableSortButton direction={sort.direction} align={align} onClick={sort.toggle} aria-describedby={hintId}>
            {content}
          </TableSortButton>
        ) : content}
        {hint && hintId ? <TableHeaderHint id={hintId}>{hint}</TableHeaderHint> : null}
      </TableHead>
    );
  }

  return (
    <TableContainer label={label} aria-describedby={describedBy} className={className}>
      <Table className={tableClassName}>
        <TableCaption>{caption}</TableCaption>
        <TableHeader>
          {headerGroups.map((group, index) => (
            <tr key={group.id}>
              {group.headers.map(renderHeader)}
              {index === 0 && trailingColumn ? (
                <TableHead id={headerId(trailingColumn.id)} rowSpan={headerGroups.length} scope="col" align="end" divider>
                  {trailingColumn.header}
                </TableHead>
              ) : null}
            </tr>
          ))}
        </TableHeader>
        <TableBody>
          {table.getRowModel().rows.map((row) => {
            const visibleRow = row as typeof row & { getVisibleCells?: () => Array<Cell<TFeatures, TData, unknown>> };
            const cells = visibleRow.getVisibleCells?.() ?? row.getAllCells();
            const rowHeaderId = cells.some((cell) => getMeta(cell.column as unknown as AnyColumn).rowHeader) ? `${id}-row-${row.id}` : null;
            return (
              <TableRow key={row.id}>
                {cells.map((cell) => {
                  const column = cell.column as unknown as AnyColumn;
                  const meta = getMeta(column);
                  const headers = [rowHeaderId, column.parent ? headerId(column.parent.id) : null, headerId(column.id)].filter(Boolean).join(" ");
                  const content = renderCell ? renderCell(cell) : flexRender(cell.column.columnDef.cell, cell.getContext());
                  const layout = { align: meta.align, numeric: meta.numeric, sticky: meta.sticky, divider: startsGroup(column), className: meta.className };
                  return meta.rowHeader && rowHeaderId
                    ? <TableRowHeader key={cell.id} id={rowHeaderId} {...layout}>{content}</TableRowHeader>
                    : <TableCell key={cell.id} headers={headers} {...layout}>{content}</TableCell>;
                })}
                {trailingColumn ? (
                  <TableCell headers={[rowHeaderId, headerId(trailingColumn.id)].filter(Boolean).join(" ")} align="end" divider className="py-1.5">
                    {trailingColumn.cell(row)}
                  </TableCell>
                ) : null}
              </TableRow>
            );
          })}
        </TableBody>
        {renderFooterCell ? (
          <TableFooter>
            <tr>
              {leafColumns.map((column) => {
                const meta = getMeta(column);
                const layout = { align: meta.align, numeric: meta.numeric, sticky: meta.sticky, divider: startsGroup(column), className: meta.className };
                const content = renderFooterCell(column.id);
                return meta.rowHeader
                  ? <TableRowHeader key={column.id} {...layout}>{content}</TableRowHeader>
                  : <TableCell key={column.id} {...layout}>{content}</TableCell>;
              })}
              {trailingColumn ? <TableCell divider /> : null}
            </tr>
          </TableFooter>
        ) : null}
      </Table>
    </TableContainer>
  );
}

export { DataTable };
export type { DataTableColumnMeta, DataTableProps, DataTableTrailingColumn };
