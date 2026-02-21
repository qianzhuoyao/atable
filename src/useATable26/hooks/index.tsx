import type { RowSelectionState } from "@tanstack/react-table";
import type { State } from "../core/type";
import { useTableStore } from "../core/useTableStore";
import { useTableActions } from "../core/useTableAction";

const useSetTableSelection = (initSelection: RowSelectionState) => {
  const selected = useTableStore<State["selected"]>(() => initSelection);
  const { setSelected } = useTableActions();
  return [selected, setSelected] as const;
};

const useSetTableColumnFilters = () => {
  const columnFilters = useTableStore<State["columnFilters"]>(
    (s) => s.columnFilters,
  );
  const { setColumnFilters } = useTableActions();
  return [columnFilters, setColumnFilters] as const;
};

const useSetTableColumnOrder = () => {
  const columnOrder = useTableStore<State["columnOrder"]>((s) => s.columnOrder);
  const { setColumnOrder } = useTableActions();
  return [columnOrder, setColumnOrder] as const;
};

const useSetTableColumnPinning = () => {
  const columnPinning = useTableStore<State["columnPinning"]>(
    (s) => s.columnPinning,
  );
  const { setColumnPinning } = useTableActions();
  return [columnPinning, setColumnPinning] as const;
};

const useSetTableColumnVisibility = () => {
  const columnVisibility = useTableStore<State["columnVisibility"]>(
    (s) => s.columnVisibility,
  );
  const { setColumnVisibility } = useTableActions();
  return [columnVisibility, setColumnVisibility] as const;
};
const useSetTableRowPinning = () => {
  const rowPinning = useTableStore<State["rowPinning"]>((s) => s.rowPinning);
  const { setRowPinning } = useTableActions();
  return [rowPinning, setRowPinning] as const;
};

const useSetTableExpanded = () => {
  const expanded = useTableStore<State["expanded"]>((s) => s.expanded);
  const { setExpanded } = useTableActions();
  return [expanded, setExpanded] as const;
};

const useSetTablePagination = () => {
  const pagination = useTableStore<State["pagination"]>((s) => s.pagination);
  const { setPagination } = useTableActions();
  return [pagination, setPagination] as const;
};

const useSetTableSorting = () => {
  const sorting = useTableStore<State["sorting"]>((s) => s.sorting);
  const { setSorting } = useTableActions();
  return [sorting, setSorting] as const;
};

const useSetTableGrouping = () => {
  const grouping = useTableStore<State["grouping"]>((s) => s.grouping);
  const { setGrouping } = useTableActions();
  return [grouping, setGrouping] as const;
};

export {
  useSetTableSelection,
  useSetTableGrouping,
  useSetTableSorting,
  useSetTablePagination,
  useSetTableExpanded,
  useSetTableRowPinning,
  useSetTableColumnPinning,
  useSetTableColumnOrder,
  useSetTableColumnVisibility,
  useSetTableColumnFilters,
};
