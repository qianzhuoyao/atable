import { useCallback } from "react";
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type OnChangeFn,
} from "@tanstack/react-table";
import type { IUseATableProps, State } from "./type";
import { applyUpdater } from "./applyUpdater";

export const useATable = <T,>(options: IUseATableProps<T>) => {
  // const selected = useTableStore<State["selected"]>((s) => s.selected);
  // const columnVisibility = useTableStore<State["columnVisibility"]>(
  //   (s) => s.columnVisibility,
  // );
  // const columnOrder = useTableStore<State["columnOrder"]>((s) => s.columnOrder);
  // const expanded = useTableStore<State["expanded"]>((s) => s.expanded);
  // const pagination = useTableStore<State["pagination"]>((s) => s.pagination);
  // const rowPinning = useTableStore<State["rowPinning"]>((s) => s.rowPinning);
  // const sorting = useTableStore<State["sorting"]>((s) => s.sorting);
  // const columnFilters = useTableStore<State["columnFilters"]>(
  //   (s) => s.columnFilters,
  // );
  // const grouping = useTableStore<State["grouping"]>((s) => s.grouping);
  // const columnPinning = useTableStore<State["columnPinning"]>(
  //   (s) => s.columnPinning,
  // );

  // const storeSnap = useMemo(
  //   () => ({
  //     selected,
  //     columnVisibility,
  //     columnFilters,
  //     rowPinning,
  //     expanded,
  //     columnOrder,
  //     grouping,
  //     pagination,
  //     columnPinning,
  //     sorting,
  //   }),
  //   [
  //     selected,
  //     columnVisibility,
  //     columnFilters,
  //     rowPinning,
  //     expanded,
  //     columnOrder,
  //     grouping,
  //     pagination,
  //     columnPinning,
  //     sorting,
  //   ],
  // );

  console.log(options, "opt");
  const onRowSelectionChange: OnChangeFn<State["selected"]> = useCallback(
    (updater) => {
      if (!options.state?.selected) return;
      const next = applyUpdater(updater, options.state?.selected);
      options.onSelectionChange?.(next);
      console.log(next, "next");
    },
    [options],
  );

  const onColumnFiltersChange: OnChangeFn<State["columnFilters"]> = useCallback(
    (updater) => {
      if (!options.state?.columnFilters) return;
      const next = applyUpdater(updater, options.state?.columnFilters);

      options.onColumnFiltersChange?.(next);
    },
    [options],
  );

  const onColumnOrderChange: OnChangeFn<State["columnOrder"]> = useCallback(
    (updater) => {
      if (!options.state?.columnOrder) return;
      const next = applyUpdater(updater, options.state?.columnOrder);

      options.onColumnOrderChange?.(next);
    },
    [options],
  );

  const onColumnPinningChange: OnChangeFn<State["columnPinning"]> = useCallback(
    (updater) => {
      if (!options.state?.columnPinning) return;
      const next = applyUpdater(updater, options.state?.columnPinning);

      options.onColumnPinningChange?.(next);
    },
    [options],
  );

  const onExpandedChange: OnChangeFn<State["expanded"]> = useCallback(
    (updater) => {
      if (!options.state?.expanded) return;
      const next = applyUpdater(updater, options.state?.expanded);

      options.onExpandedChange?.(next);
    },
    [options],
  );

  const onGroupingChange: OnChangeFn<State["grouping"]> = useCallback(
    (updater) => {
      if (!options.state?.grouping) return;
      const next = applyUpdater(updater, options.state?.grouping);

      options.onGroupingChange?.(next);
    },
    [options],
  );

  const onPaginationChange: OnChangeFn<State["pagination"]> = useCallback(
    (updater) => {
      if (!options.state?.pagination) return;
      const next = applyUpdater(updater, options.state?.pagination);

      options.onPaginationChange?.(next);
    },
    [options],
  );

  const onSortingChange: OnChangeFn<State["sorting"]> = useCallback(
    (updater) => {
      if (!options.state?.sorting) return;
      const next = applyUpdater(updater, options.state?.sorting);

      options.onSortingChange?.(next);
    },
    [options],
  );

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable<T>({
    data: options.data,
    columns: options.columns,

    state: {
      rowSelection: options.state?.selected,
      columnVisibility: options.state?.columnVisibility,
      columnFilters: options.state?.columnFilters,
      rowPinning: options.state?.rowPinning,
      expanded: options.state?.expanded,
      columnOrder: options.state?.columnOrder,
      grouping: options.state?.grouping,
      pagination: options.state?.pagination,
      columnPinning: options.state?.columnPinning,
      sorting: options.state?.sorting,
    },

    enableRowSelection: options.selection?.enabled,
    enableMultiRowSelection: options.selection?.mode === "multiple",

    onRowSelectionChange,
    onColumnFiltersChange,
    onColumnOrderChange,
    onColumnPinningChange,
    onExpandedChange,
    onGroupingChange,
    onPaginationChange,
    onSortingChange,

    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return table;
};
