import type { ColumnDef, ColumnOrderState } from "@tanstack/react-table";

export interface IUseATableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  state?: Partial<State>;
  selection?: Partial<{
    mode: "single" | "multiple" | "none";
    disabled: (row: T) => boolean;
  }>;
  // onSelectionChange?: (selected: RowSelectionState) => void;
  // onColumnFiltersChange?: (columnFilters: ColumnFiltersState) => void;
  // onColumnOrderChange?: (columnOrder: ColumnOrderState) => void;
  // onColumnPinningChange?: (columnPinning: ColumnPinningState) => void;
  // onExpandedChange?: (expanded: ExpandedState) => void;
  // onGroupingChange?: (grouping: GroupingState) => void;
  // onPaginationChange?: (pagination: PaginationState) => void;
  // onSortingChange?: (sorting: SortingState) => void;
}
export type State = {
  columnOrder: ColumnOrderState;
};

export type StoreBundle = {
  api: ReturnType<typeof createStore<State>>;
  useStore: <T>(sel: (s: State) => T, eq?: (a: T, b: T) => boolean) => T;
  actions: {
    setColumnOrder: (columnOrder: State["columnOrder"]) => void;
  };
};

export type IAddEventListener = {
  onSelectChange: (selected: State["selected"]) => void;
};
export type Comparer<T> = (a: T, b: T) => boolean;

export interface IHandleEvents {
  onHandleSelectionChange?: (selected: State["selected"]) => void;
  onHandleColumnFiltersChange?: (columnFilters: State["columnFilters"]) => void;
  onHandleGroupingChange?: (grouping: State["grouping"]) => void;
  onHandleSortingChange?: (sorting: State["sorting"]) => void;
  onHandleColumnPinningChange?: (columnPinning: State["columnPinning"]) => void;
  onHandleRowPinningChange?: (rowPinning: State["rowPinning"]) => void;
  onHandlePaginationChange?: (pagination: State["pagination"]) => void;
  onHandleExpandedChange?: (expanded: State["expanded"]) => void;
  onHandleColumnVisibilityChange?: (
    columnVisibility: State["columnVisibility"],
  ) => void;
  onHandleColumnOrderChange?: (columnOrder: State["columnOrder"]) => void;
}
