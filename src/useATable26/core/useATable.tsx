import {
  getCoreRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { IUseATableProps } from "./type";

export const useCreateATable = <T,>(options: IUseATableProps<T>) => {
  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable<T>({
    data: options.data,
    columns: options.columns,
    state: {
      globalFilter: options.state?.globalFilter,
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
    enableRowSelection: options.selection?.disabled
      ? false
      : (r) => !options.selection?.disabled?.(r.original),
    enableMultiRowSelection: options.selection?.mode === "multiple",
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
  });

  return table;
};
