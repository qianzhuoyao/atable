import type {
  ColumnDef,
  ColumnFiltersState,
  ColumnOrderState,
  ColumnVisibilityState,
  ExpandedState,
  GroupingState,
  PaginationState,
  RowPinningState,
  RowSelectionState,
  ColumnPinningState,
  SortingState,
} from "@tanstack/react-table";

export interface IUseATableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  state?: Partial<State>;
  selection?: {
    mode: "single" | "multiple";
    enabled: boolean;
  };
  onSelectionChange?: (selected: RowSelectionState) => void;
  onColumnFiltersChange?: (columnFilters: ColumnFiltersState) => void;
  onColumnOrderChange?: (columnOrder: ColumnOrderState) => void;
  onColumnPinningChange?: (columnPinning: ColumnPinningState) => void;
  onExpandedChange?: (expanded: ExpandedState) => void;
  onGroupingChange?: (grouping: GroupingState) => void;
  onPaginationChange?: (pagination: PaginationState) => void;
  onSortingChange?: (sorting: SortingState) => void;
}
export type State = {
  columnOrder: ColumnOrderState;
  columnVisibility: ColumnVisibilityState;
  selected: RowSelectionState;
  expanded: ExpandedState;
  pagination: PaginationState;
  rowPinning: RowPinningState;
  sorting: SortingState;
  grouping: GroupingState;
  columnFilters: ColumnFiltersState;
  columnPinning: ColumnPinningState;
};

export type StoreBundle = {
  api: ReturnType<typeof createStore<State>>;
  useStore: <T>(sel: (s: State) => T, eq?: (a: T, b: T) => boolean) => T;
  actions: {
    patch: (p: State) => void;
    setSelected: (selected: State["selected"]) => void;
    setColumnFilters: (columnFilters: State["columnFilters"]) => void;
    setGrouping: (grouping: State["grouping"]) => void;
    setSorting: (sorting: State["sorting"]) => void;
    setColumnPinning: (columnPinning: State["columnPinning"]) => void;
    setRowPinning: (rowPinning: State["rowPinning"]) => void;
    setPagination: (pagination: State["pagination"]) => void;
    setExpanded: (expanded: State["expanded"]) => void;
    setColumnVisibility: (columnVisibility: State["columnVisibility"]) => void;
    setColumnOrder: (columnOrder: State["columnOrder"]) => void;
  };
};

export type IAddEventListener = {
  onSelectChange: (selected: State["selected"]) => void;
};
export type Comparer<T> = (a: T, b: T) => boolean;
