import type { State } from "../core/type";
import { useTableStore } from "../core/useTableStore";
import { useTableActions } from "../core/useTableAction";

const useSetTableSelection = (initSelection: State["selected"]) => {
  const selected = useTableStore<State["selected"]>(() => initSelection);
  const { setSelected } = useTableActions();
  return [selected, setSelected] as const;
};

const useSetTableColumnFilters = (initFilter: State["columnFilters"]) => {
  const columnFilters = useTableStore<State["columnFilters"]>(() => initFilter);
  const { setColumnFilters } = useTableActions();
  return [columnFilters, setColumnFilters] as const;
};

const useSetTableColumnOrder = (initColumnOrder: State["columnOrder"]) => {
  const columnOrder = useTableStore<State["columnOrder"]>(
    () => initColumnOrder,
  );
  const { setColumnOrder } = useTableActions();
  return [columnOrder, setColumnOrder] as const;
};

const useSetTableColumnPinning = (
  initColumnPinning: State["columnPinning"],
) => {
  const columnPinning = useTableStore<State["columnPinning"]>(
    () => initColumnPinning,
  );
  const { setColumnPinning } = useTableActions();
  return [columnPinning, setColumnPinning] as const;
};

const useSetTableColumnVisibility = (
  initColumnVisibility: State["columnVisibility"],
) => {
  const columnVisibility = useTableStore<State["columnVisibility"]>(
    () => initColumnVisibility,
  );
  const { setColumnVisibility } = useTableActions();
  return [columnVisibility, setColumnVisibility] as const;
};
const useSetTableRowPinning = (initRowPinning: State["rowPinning"]) => {
  const rowPinning = useTableStore<State["rowPinning"]>(() => initRowPinning);
  const { setRowPinning } = useTableActions();
  return [rowPinning, setRowPinning] as const;
};

const useSetTableExpanded = (initExpanded: State["expanded"]) => {
  const expanded = useTableStore<State["expanded"]>(() => initExpanded);
  const { setExpanded } = useTableActions();
  return [expanded, setExpanded] as const;
};

const useSetTablePagination = (initPagination: State["pagination"]) => {
  const pagination = useTableStore<State["pagination"]>(() => initPagination);
  const { setPagination } = useTableActions();
  return [pagination, setPagination] as const;
};

const useSetTableSorting = (initSorting: State["sorting"]) => {
  const sorting = useTableStore<State["sorting"]>(() => initSorting);
  const { setSorting } = useTableActions();
  return [sorting, setSorting] as const;
};

const useSetTableGrouping = (initGrouping: State["grouping"]) => {
  const grouping = useTableStore<State["grouping"]>(() => initGrouping);
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
