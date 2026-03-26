import {
  getCoreRowModel,
  getFilteredRowModel,
  getGroupedRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
  type PaginationState,
  type Row,
} from "@tanstack/react-table";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import { TableTemplate } from "./useATable26/core/template";
import { ToolBar } from "./useATable26/core/toolbar";
import { useCallback, useLayoutEffect, useMemo, useState } from "react";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { TableProvider } from "./useATable26/core/context";
import { useTableStore } from "./useATable26/core/useTableStore";
import { useTableActions } from "./useATable26/core/useTableAction";
interface DataItemType {
  name: string;
}

const TableBody = () => {
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: 20,
  });
  const data = useMemo<DataItemType[]>(
    () => [
      {
        name: "1",
      },
      {
        name: "2",
      },
      {
        name: "3",
      },
      {
        name: "4",
      },
    ],
    [],
  );
  const columns = useMemo<ColumnDef<DataItemType>[]>(
    () => [
      {
        id: "name",
        accessorKey: "name",
        cell: (e) => e.getValue(),
      },
    ],
    [],
  );

  const columnOrder = useTableStore((s) => s.columnOrder);

  const { setColumnOrder } = useTableActions();

  useLayoutEffect(() => {
    setColumnOrder(columns.map((c) => c.id!));
  }, [columns, setColumnOrder]);

  const enableMultiRowSelection: (row: Row<DataItemType>) => boolean =
    useCallback(() => {
      return true;
    }, []);

  // eslint-disable-next-line react-hooks/incompatible-library
  const table = useReactTable<DataItemType>({
    data: data,
    columns: columns,
    state: {
      pagination,
      columnOrder,
      // globalFilter: options.state?.globalFilter,
      // rowSelection: options.state?.selected,
      // columnVisibility: options.state?.columnVisibility,
      // columnFilters: options.state?.columnFilters,
      // rowPinning: options.state?.rowPinning,
      // expanded: options.state?.expanded,
      // columnOrder: options.state?.columnOrder,
      // grouping: options.state?.grouping,
      // pagination: options.state?.pagination,
      // columnPinning: options.state?.columnPinning,
      // sorting: options.state?.sorting,
    },
    onPaginationChange: setPagination,
    enableExpanding: true,
    enableMultiRowSelection,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getGroupedRowModel: getGroupedRowModel(),
  });
  //当前页数据
  const currentPageData = table.getRowModel().rows;

  const headGroup = table.getHeaderGroups();
  return (
    <div className="App" style={{ width: "100vw", height: "100vh" }}>
      <ToolBar></ToolBar>
      <TableTemplate<DataItemType>
        currentPageData={currentPageData}
        headGroup={headGroup}
      ></TableTemplate>
      {/* <Pagination pagination={pagination}></Pagination> */}
    </div>
  );
};

function App() {
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {}),
  );

  const handleDragEnd = useCallback(() => {}, []);

  return (
    <TableProvider>
      <DndContext
        collisionDetection={closestCenter}
        modifiers={[restrictToHorizontalAxis]}
        onDragEnd={handleDragEnd}
        sensors={sensors}
      >
        <TableBody />
      </DndContext>
    </TableProvider>
  );
}

export default App;
