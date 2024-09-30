import {
  CSSProperties,
  Fragment,
  HTMLProps,
  memo,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { IEffect, ITableParams } from "./type.ts";
import { Empty, Pagination, Popover } from "antd";
import "./index.css";
import {
  AppstoreOutlined,
  ArrowDownOutlined,
  ArrowRightOutlined,
  CaretDownOutlined,
  CaretUpOutlined,
  InfoCircleOutlined,
  RedoOutlined,
  SettingOutlined,
  SwapOutlined,
} from "@ant-design/icons";
import { useTableContext } from "./reducer.ts";
import {
  DndContext,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  closestCenter,
  type DragEndEvent,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import { restrictToHorizontalAxis } from "@dnd-kit/modifiers";
import {
  arrayMove,
  SortableContext,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";

// needed for row & cell level scope DnD setup
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  getCoreRowModel,
  useReactTable,
  flexRender,
  Header,
  Table,
  ColumnResizeMode,
  ColumnResizeDirection,
  Cell,
  RowSelectionState,
  ExpandedState,
  getExpandedRowModel,
  getFilteredRowModel,
  HeaderContext,
  VisibilityState,
  ColumnDef,
  getPaginationRowModel,
  PaginationState,
} from "@tanstack/react-table";
import { Loading } from "./loading.tsx";

const DEFAULT_SELECT_WIDTH = 40;

const IndeterminateCheckbox = memo(
  ({
    indeterminate,
    className = "",
    ...rest
  }: { indeterminate?: boolean } & HTMLProps<HTMLInputElement>) => {
    const ref = useRef<HTMLInputElement>(null!);

    useEffect(() => {
      if (typeof indeterminate === "boolean") {
        ref.current.indeterminate = !rest.checked && indeterminate;
      }
    }, [ref, indeterminate, rest.checked]);

    return (
      <input
        type="checkbox"
        ref={ref}
        className={className + " cursor-pointer"}
        {...rest}
      />
    );
  }
);

const SELECT_KEY = "__selectionCheckBox__";

const HeaderCheckBox = <T,>({
  table,
  selectModel,
  expand,
  customExpand,
}: {
  table: Table<T>;
  selectModel: boolean;
  expand?: boolean;
  customExpand: ITableParams<T>["customExpand"];
}) => {
  console.log("table.getIsAllRowsSelected()");

  return (
    <>
      {selectModel && (
        <IndeterminateCheckbox
          {...{
            checked: table.getIsAllRowsSelected(),
            indeterminate: table.getIsSomeRowsSelected(),
            onChange: table.getToggleAllRowsSelectedHandler(),
          }}
        />
      )}
      {expand ? (
        <div
          {...{
            style: {
              cursor: "pointer",
            },
            onClick: table.getToggleAllRowsExpandedHandler(),
          }}
        >
          {table.getIsAllRowsExpanded() ? (
            customExpand ? (
              customExpand({ type: "isHead", collapsed: true })
            ) : (
              <ArrowDownOutlined />
            )
          ) : customExpand ? (
            customExpand({ type: "isHead", collapsed: false })
          ) : (
            <ArrowRightOutlined />
          )}
        </div>
      ) : (
        <></>
      )}
    </>
  );
};

const ColVisibleContent = <T,>({
  table,
  tag,
  onTableSync,
  popupColHidden,
}: {
  tag?: string;
  onTableSync: IEffect<T>["onTableSync"];
  table: Table<T>;
  popupColHidden?: (prop: string) => boolean;
}) => {
  return (
    <>
      <div>
        <label>
          <input
            {...{
              type: "checkbox",
              checked: table.getIsAllColumnsVisible(),
              onChange: table.getToggleAllColumnsVisibilityHandler(),
            }}
          />
          全部
        </label>
      </div>
      {table.getAllLeafColumns().map((column, index) => {
        if (column.id === SELECT_KEY) {
          return <Fragment key={column.id + "-c-" + index}></Fragment>;
        }
        return !popupColHidden?.(column.id) ? (
          <div key={column.id + "-c-" + index}>
            <label>
              <input
                {...{
                  type: "checkbox",
                  checked: column.getIsVisible(),
                  onChange: (e) => {
                    column.getToggleVisibilityHandler()(e);
                    onTableSync?.(
                      table.getAllColumns().map((col) => {
                        return {
                          field: col.id,
                          moduleKey: tag,
                          visible: col.getIsVisible(),
                          flex: col.getSize(),
                        };
                      })
                    );
                  },
                }}
              />
              {typeof column.columnDef.header === "function"
                ? column.columnDef.header?.({
                    column,
                    header: {},
                    table,
                  } as HeaderContext<T, unknown>)
                : column.columnDef.header}
            </label>
          </div>
        ) : (
          <></>
        );
      })}
    </>
  );
};

const DraggableTableHeader = <T,>({
  header,
  table,
  hasSyncPermission,
  depthSize,
  headerStyle,
  columnResizeMode,
  onHeaderResizeStart,
  onTableSync,
  colSortable,
  onAscSort,
  onDescSort,
  expand,
  onHeaderResizeEnd,
}: {
  depthSize: unknown;
  colSortable?: (prop: string) => boolean;
  hasSyncPermission: number;
  header: Header<T, unknown>;
  table: Table<T>;
  expand?: boolean;
  headerStyle?: (prop: string) => CSSProperties;
  columnResizeMode: ColumnResizeMode;
} & Pick<
  IEffect<T>,
  | "onHeaderResizeStart"
  | "onHeaderResizeEnd"
  | "onTableSync"
  | "onAscSort"
  | "onDescSort"
>) => {
  const { state } = useTableContext();
  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useSortable({
      id: header.column.id,
    });

  console.log(isDragging, listeners, attributes, "isDrlistenersagging");
  const style: CSSProperties = {
    position: "relative",
    transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    cursor: isDragging ? "pointer" : "",
    whiteSpace: "nowrap",
    width: header.column.getSize(),
    zIndex: 111,
  };

  const onHandleResizeOver = useCallback(() => {
    onHeaderResizeEnd?.(header.id);
    console.log(table.getAllColumns(), "table.getAllColumns()");
    if (hasSyncPermission) {
      onTableSync?.(
        table.getAllColumns().map((col) => {
          return {
            field: col.id,
            moduleKey: state.tag,
            visible: col.getIsVisible(),
            flex: col.getSize(),
          };
        })
      );
    }
  }, [
    hasSyncPermission,
    header.id,
    onHeaderResizeEnd,
    onTableSync,
    state.tag,
    table,
  ]);

  const onHandleResizeTouchHandler = useCallback<
    React.TouchEventHandler<HTMLDivElement>
  >(
    (e) => {
      console.log("getExpandedDepth22221");
      e.preventDefault();
      const resizeHandler = header.getResizeHandler();
      resizeHandler(e);
      onHeaderResizeStart?.(header.id);
    },
    [header, onHeaderResizeStart]
  );

  const onHandleResizeHandler = useCallback<
    React.MouseEventHandler<HTMLDivElement>
  >(
    (e) => {
      console.log("getExpandedDepth2222");
      e.preventDefault();
      const resizeHandler = header.getResizeHandler();
      resizeHandler(e);
      onHeaderResizeStart?.(header.id);
    },
    [header, onHeaderResizeStart]
  );
  console.log(table.getExpandedDepth(), attributes, "getExpandedDepth");
  return (
    <div
      {...attributes}
      {...(header.column.id !== SELECT_KEY ? listeners : {})}
      ref={setNodeRef}
      key={header.id + "-dh-"}
      style={{
        ...(header.column.id !== SELECT_KEY ? style : { zIndex: 200 }),
        height: "100%",
        position: header.id === SELECT_KEY ? "sticky" : "relative",
        left: header.id === SELECT_KEY ? "0px" : "0px",
        background: "rgba(245, 248, 253, 1)",
        display: "flex",
        alignItems: "center",
        ...headerStyle?.(header.column.id),
      }}
    >
      <div
        className="a-syn-truncate"
        style={{
          height: "100%",
          minWidth:
            header.column.id !== SELECT_KEY
              ? header.getSize()
              : table.getExpandedDepth() *
                  (typeof depthSize === "number" ? depthSize : 15) +
                DEFAULT_SELECT_WIDTH,
          display: "flex",
          alignItems: "center",
          justifyContent:
            header.column.id === SELECT_KEY && !expand ? "center" : "",
          position: "relative",
        }}
        onClick={() => {
          console.log("ddddddddddddddd");
        }}
      >
        {header.isPlaceholder
          ? null
          : flexRender(header.column.columnDef.header, header.getContext())}
        {colSortable?.(header.column.id) && header.column.id !== SELECT_KEY ? (
          <div
            style={{
              fontSize: "10px",
              zoom: 0.8,
              paddingLeft: "5px",
              position: "relative",
            }}
          >
            <CaretUpOutlined
              style={{
                cursor: "pointer",
              }}
              onClick={() => {
                console.log("cwcwwcwcwcwcw5555");
                onAscSort?.(header.column.id);
              }}
            />
            <CaretDownOutlined
              style={{
                display: "block",
                cursor: "pointer",
              }}
              onClick={() => {
                onDescSort?.(header.column.id);
              }}
            />
          </div>
        ) : (
          <></>
        )}
        <div
          {...{
            // onDoubleClick: () => header.column.resetSize(),
            onMouseDown: onHandleResizeHandler,
            onTouchStart: onHandleResizeTouchHandler,
            onMouseUp: onHandleResizeOver,
            onTouchEnd: onHandleResizeOver,
            className: `${header.id !== SELECT_KEY ? "a-syn-resizer" : ""} ${
              table.options.columnResizeDirection
            } ${header.column.getIsResizing() ? "a-syn-isResizing" : ""}`,
            style: {
              transform:
                columnResizeMode === "onEnd" && header.column.getIsResizing()
                  ? `translateX(${
                      (table.options.columnResizeDirection === "rtl" ? -1 : 1) *
                      (table.getState().columnSizingInfo.deltaOffset ?? 0)
                    }px)`
                  : "",
            },
          }}
        />
      </div>
    </div>
  );
};

const RESIZABLE = 0b1;
const DRAGGABLE = 0b10;
const SYNC = 0b100;
export const TableSlot = <T,>({
  tableState,
  customPagination,
  onSelectChange,
  onHeaderMoveEnd,
  onHeaderMoveStart,
  onHeaderResizeEnd,
  onHeaderResizeStart,
  onAscSort,
  onDescSort,
  onTableSync,
  onColVisibleChange,
  onRefreshCallback,
  onPageChange,
  onRowClick,
}: {
  customPagination?: ReactNode | null;
  tableState: ITableParams<T>;
} & Omit<IEffect<T>, "setUpdate">) => {
  const {
    col,
    data,
    pageIndex,
    pageSize,
    total,
    getRowCanExpand,
    renderSubComponent,
    selectedRowKeyList,
    rowSelectDisable,
    clickedRowKeyList,
    rowStyle,
    rowClickedBackground,
    rowSelectedBackground,
    rowClassName,
    cellStyle,
    collapse,
    customExpand,
    colVisibleColIdList,
    popupColHidden,
    colSortable,
    headerStyle,
    loading,
    style,
  } = tableState;
  const { state: ctxState } = useTableContext();
  const setVisibleAct = useCallback(
    (columns: ColumnDef<T>[]) => {
      const visibleRowKeyList: unknown[] | undefined =
        typeof colVisibleColIdList === "function"
          ? colVisibleColIdList()
          : colVisibleColIdList;
      const list: VisibilityState = {};
      if (visibleRowKeyList) {
        columns.map((col) => {
          console.log(col.id, visibleRowKeyList, "col.id");
          if (col.id) {
            if (visibleRowKeyList.includes(col.id) || col.id === SELECT_KEY) {
              list[col.id] = true;
            } else {
              list[col.id] = false;
            }
          }
        });
      }
      console.log(visibleRowKeyList, columns, "visibleRowKeyList");

      // visibleRowKeyList?.map((rowKey) => {
      //   if (ctxState.config.rowKey && typeof rowKey === "string") {
      //     list[rowKey] = true;
      //   }
      // });
      console.log(list, "lists");

      return list;
    },
    [colVisibleColIdList]
  );
  const getColumns = useCallback(() => {
    if (ctxState.config.selectModel || ctxState.config.expand) {
      if (
        col &&
        (col[0] as { accessorKey: string }).accessorKey !== SELECT_KEY
      ) {
        //需要对显隐做控制
        col.unshift({
          id: SELECT_KEY,
          accessorKey: SELECT_KEY,
          size: DEFAULT_SELECT_WIDTH,
          header: ({ table }) => (
            <HeaderCheckBox<T>
              selectModel={!!ctxState.config.selectModel}
              customExpand={customExpand}
              table={table}
              expand={ctxState.config.expand}
            ></HeaderCheckBox>
          ),
          cell: ({ row }) => (
            <div
              style={{
                paddingLeft: `${
                  row.depth *
                  (typeof ctxState.config.depthSize === "number"
                    ? ctxState.config.depthSize
                    : 15)
                }px`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {ctxState.config.selectModel && (
                  <IndeterminateCheckbox
                    {...{
                      disabled: rowSelectDisable?.(row.original),
                      checked:
                        row.getIsSelected() || row.getIsAllSubRowsSelected(),
                      indeterminate: row.getIsSomeSelected(),
                      onChange: row.getToggleSelectedHandler(),
                    }}
                  />
                )}

                {ctxState.config.expand && row.getCanExpand() ? (
                  <div
                    {...{
                      onClick: row.getToggleExpandedHandler(),
                      style: { cursor: "pointer" },
                    }}
                  >
                    {row.getIsExpanded() ? (
                      customExpand ? (
                        customExpand({ type: "isLeaf", collapsed: true })
                      ) : (
                        <ArrowDownOutlined />
                      )
                    ) : customExpand ? (
                      customExpand({ type: "isLeaf", collapsed: false })
                    ) : (
                      <ArrowRightOutlined />
                    )}
                  </div>
                ) : (
                  <></>
                )}
              </div>
            </div>
          ),
          footer: (props) => props.column.id,
        });
      }
    }
    return col;
  }, [
    col,
    ctxState.config.depthSize,
    ctxState.config.expand,
    ctxState.config.selectModel,
    customExpand,
    rowSelectDisable,
  ]);
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: pageIndex - 1 <= 0 ? 0 : pageIndex - 1,
    pageSize,
  });
  const setClickedAct = useCallback(() => {
    const tableClickedRowKeyList: unknown[] | undefined =
      typeof clickedRowKeyList === "function"
        ? clickedRowKeyList()
        : clickedRowKeyList;

    return tableClickedRowKeyList || [];
  }, [clickedRowKeyList]);
  const [columnSizing, setColumnSizing] = useState({});
  const [clickedRows, setClickedRows] = useState<unknown[]>(() =>
    setClickedAct()
  );
  const [filterModel, setFilterModel] = useState<"none" | "selected">("none");
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(
    () => {
      return setVisibleAct(getColumns());
    }
  );
  const setSelectionAct = useCallback(() => {
    console.log("d3wdfff");
    const selectRowKeyList: unknown[] | undefined =
      typeof selectedRowKeyList === "function"
        ? selectedRowKeyList()
        : selectedRowKeyList;

    const key = ctxState.config?.rowKey;
    if (!key) {
      return {};
    }
    const selection: RowSelectionState = {};
    selectRowKeyList?.map((rowKey) => {
      if (ctxState.config.rowKey && typeof rowKey === "string") {
        selection[rowKey] = true;
      }
    });
    return selection;
  }, [ctxState.config.rowKey, selectedRowKeyList]);

  const [rowSelection, setRowSelection] =
    useState<RowSelectionState>(setSelectionAct);

  useEffect(() => {
    setRowSelection(setSelectionAct);
  }, [setSelectionAct]);
  const [permissions, setPermissions] = useState(DRAGGABLE | RESIZABLE);

  const checkData = useMemo(() => data || [], [data]);
  console.log(checkData, "checkData");

  const columns = useMemo(() => {
    console.log("d23gfgg");
    const col = getColumns();
    setColumnVisibility(() => {
      return setVisibleAct(col);
    });
    return col;
  }, [getColumns, setVisibleAct]);
  useEffect(() => {
    if (collapse !== void 0) {
      if (collapse) {
        setExpanded(true);
      } else {
        setExpanded({});
      }
    }
  }, [collapse]);
  useEffect(() => {
    console.log("请问地区的弟弟问题");
    setColumnVisibility(() => {
      return setVisibleAct(columns);
    });
  }, [columns, setVisibleAct]);
  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [columnResizeMode] = useState<ColumnResizeMode>("onChange");
  const [columnResizeDirection] = useState<ColumnResizeDirection>("ltr");
  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    columns.map((c) => c.id || "")
  );

  useEffect(() => {
    console.log(columns, "columnssss");
    setColumnOrder(() => columns.map((c) => c.id || ""));
  }, [columns]);

  const DragAlongCell = <T,>({
    cell,
    expand,
  }: {
    cell: Cell<T, unknown>;
    expand?: boolean;
  }) => {
    const { isDragging, setNodeRef, transform } = useSortable({
      id: cell.column.id,
    });
    const style: CSSProperties = {
      opacity: isDragging ? 0.8 : 1,
      position: "relative",
      transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing

      width: cell.column.getSize(),
      zIndex: isDragging ? 149 : 0,
    };
    return (
      <div
        key={cell.id + "-dc-"}
        ref={setNodeRef}
        className="a-syn-cell"
        style={{
          ...(cell.column.id !== SELECT_KEY ? style : { zIndex: 120 }),
          display: "flex",
          justifyContent:
            cell.column.id === SELECT_KEY && !expand ? "center" : "",
          position: cell.column.id === SELECT_KEY ? "sticky" : "static",
          left: cell.column.id === SELECT_KEY ? "0px" : "0px",
          // minWidth: cell.column.getSize(),
          minWidth:
            cell.column.id !== SELECT_KEY
              ? cell.column.getSize()
              : table.getExpandedDepth() * 15 + DEFAULT_SELECT_WIDTH,
          borderBottom: "1px solid rgba(229, 229, 229, 1)",
          minHeight: "36px",
          lineHeight: "36px",
          color: "rgba(0, 0, 0, 0.85)",
          fontSize: "14px",
          ...cellStyle?.(cell.column.id, cell.row.original),
        }}
      >
        {cell.getIsAggregated()
          ? flexRender(cell.column.columnDef.cell, cell.getContext())
          : cell.getIsPlaceholder()
          ? null // For cells with repeated values, render null
          : // Otherwise, just render the regular cell
            flexRender(cell.column.columnDef.cell, cell.getContext())}
      </div>
    );
  };

  const table = useReactTable({
    data: checkData,
    columns,
    state: {
      columnVisibility,
      rowSelection,
      columnOrder,
      columnSizing,
      expanded,
      pagination,
    },
    getRowCanExpand,
    columnResizeMode,
    columnResizeDirection,
    getRowId: (row) => {
      try {
        return (row as Record<string, string>)[
          ctxState.config.rowKey as string
        ];
      } catch (e) {
        //ignore
        console.error(e);
        throw new Error(e as string);
      }
    },
    onExpandedChange: setExpanded,
    getSubRows: (row) => {
      try {
        return (row as Record<string, T[]>)[
          (ctxState.config.subRowsKey || "subRows") as string
        ];
      } catch (e) {
        //ignore
        console.error(e);
      }
    },
    getPaginationRowModel: getPaginationRowModel(),
    onPaginationChange: setPagination,
    onColumnSizingChange: setColumnSizing,
    onColumnOrderChange: setColumnOrder,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    onRowSelectionChange: setRowSelection,
    getExpandedRowModel: getExpandedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    debugTable: false,
    debugHeaders: false,
    debugColumns: false,
  });
  useEffect(() => {
    onSelectChange(table.getSelectedRowModel().rows.map((r) => r.original));
  }, [onSelectChange, rowSelection, table]);
  useEffect(() => {
    console.log(columnVisibility, "columnVisibility");
    const showColList = table.getVisibleFlatColumns();
    onColVisibleChange(
      showColList.map((c) => c.id).filter((z) => ![SELECT_KEY].includes(z))
    );
  }, [columnVisibility, onColVisibleChange, table]);

  useEffect(() => {
    onPageChange({ ...pagination, pageIndex: pagination.pageIndex + 1 });
  }, [onPageChange, pagination]);

  useEffect(() => {
    table.setPageIndex(pageIndex - 1 <= 0 ? 0 : pageIndex - 1);
    table.setPageSize(pageSize);
  }, [pageIndex, pageSize, table]);

  console.log(
    checkData,
    rowSelection,
    ctxState.config.showTools,
    columnOrder,
    "ctxState.config.showTools"
  );

  const hasSyncPermission = useMemo(() => {
    return permissions & SYNC;
  }, [permissions]);

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      console.log(active, over, "active, overs");
      if (active && over && active.id !== over.id && over.id !== SELECT_KEY) {
        setColumnOrder((columnOrder) => {
          const oldIndex = columnOrder.indexOf(active.id as string);
          const newIndex = columnOrder.indexOf(over.id as string);
          return arrayMove(columnOrder, oldIndex, newIndex); //this is just a splice util
        });
        onHeaderMoveEnd?.(active.id);
        if (hasSyncPermission) {
          onTableSync?.(
            table.getAllColumns().map((col) => {
              return {
                field: col.id,
                moduleKey: ctxState.tag,
                visible: col.getIsVisible(),
                flex: col.getSize(),
              };
            })
          );
        }
      }
    },
    [ctxState.tag, hasSyncPermission, onHeaderMoveEnd, onTableSync, table]
  );

  const onHandleAutoComputedWidth = useCallback(() => {}, []);
  const onHandleRefresh = useCallback(() => {
    onRefreshCallback?.();
  }, [onRefreshCallback]);

  const handleDragStart = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      console.log(active, over, event, "ddddsssss");
      onHeaderMoveStart?.(active.id);
    },
    [onHeaderMoveStart]
  );
  const sensors = useSensors(
    useSensor(TouchSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {}),
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 5,
      },
    })
  );
  const onHandleQuitFilter = useCallback(() => {
    setFilterModel("none");
  }, []);
  const onHandleClearSelection = useCallback(() => {
    setRowSelection({});
  }, []);
  const onHandleClickRow = useCallback(
    (row: T) => {
      if (!ctxState.config.rowKey) {
        throw new Error("rowKey 必须存在");
      }
      const cur = (row as Record<string, unknown>)[
        ctxState.config.rowKey || ""
      ];
      if (cur) {
        setClickedRows((rows) => {
          if (rows.includes(cur)) {
            return [];
          } else {
            return [cur];
          }
        });
      }
      onRowClick?.(row);
    },
    [ctxState.config.rowKey, onRowClick]
  );

  const onFilterSelectionRows = useCallback(() => {
    if (filterModel === "none") {
      setFilterModel("selected");
    }
  }, [filterModel]);

  if (loading) {
    return (
      <div
        style={{
          overflow: "hidden",
          padding: "5px",
          fontSize: "50px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          border: "1px solid rgba(54, 122, 228, 0.3)",
          borderRadius: "2px",
          ...style,
        }}
      >
        <Loading></Loading>
      </div>
    );
  }

  console.log(table.getRowModel(), checkData, pagination, "csew3fggf");

  return (
    <DndContext
      collisionDetection={closestCenter}
      modifiers={[restrictToHorizontalAxis]}
      onDragEnd={handleDragEnd}
      onDragStart={handleDragStart}
      sensors={sensors}
    >
      <div
        style={{
          overflow: "hidden",
          padding: "5px",
          ...style,
        }}
      >
        <>
          {ctxState.config.showTools || ctxState.config.showSelectedInfo ? (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                borderRadius: "2px",
                fontSize: "14px",
                height: "32px",
                width: style?.width,
                background: "rgba(54, 122, 228, 0.05)",
                border: "1px solid rgba(54, 122, 228, 0.3)",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginLeft: "16px",
                }}
              >
                {ctxState.config.showSelectedInfo ? (
                  <>
                    <InfoCircleOutlined
                      style={{
                        marginRight: "5px",
                        color: "rgba(54, 122, 228, 1)",
                      }}
                    />
                    <div>
                      <span>已选择</span>
                      <span
                        style={{
                          cursor: "pointer",
                          padding: "0px 5px",
                          fontWeight: "500",
                          color: "rgba(54, 122, 228, 1)",
                        }}
                        onClick={onFilterSelectionRows}
                      >
                        {Object.keys(rowSelection).length}
                      </span>
                      <span>项</span>
                    </div>
                    <div>
                      {filterModel === "none" &&
                      Object.keys(rowSelection).length ? (
                        <span
                          style={{
                            cursor: "pointer",
                            paddingLeft: "5px",
                            color: "rgba(54, 122, 228, 1)",
                          }}
                          onClick={onHandleClearSelection}
                        >
                          {"清空"}
                        </span>
                      ) : (
                        <></>
                      )}
                      {filterModel === "selected" ? (
                        <span
                          style={{
                            cursor: "pointer",
                            paddingLeft: "5px",
                            color: "rgba(54, 122, 228, 1)",
                          }}
                          onClick={onHandleQuitFilter}
                        >
                          退出删选模式
                        </span>
                      ) : (
                        <></>
                      )}
                    </div>
                  </>
                ) : (
                  <></>
                )}
              </div>
              <div
                style={{
                  marginRight: "16px",
                }}
              >
                {ctxState.config.showTools ? (
                  <>
                    {!ctxState.config.tools ||
                    ctxState.config.tools.includes("refresh") ? (
                      <RedoOutlined
                        style={{
                          cursor: "pointer",
                          paddingLeft: "5px",
                          color: "rgb(54, 122, 228)",
                        }}
                        onClick={onHandleRefresh}
                      />
                    ) : (
                      <></>
                    )}
                    {!ctxState.config.tools ||
                    ctxState.config.tools.includes("colVisible") ? (
                      <Popover
                        placement="bottom"
                        content={
                          <ColVisibleContent
                            tag={ctxState.tag}
                            onTableSync={onTableSync}
                            popupColHidden={popupColHidden}
                            table={table}
                          />
                        }
                      >
                        <AppstoreOutlined
                          style={{
                            cursor: "pointer",
                            paddingLeft: "5px",
                            color: "rgb(54, 122, 228)",
                          }}
                        />
                      </Popover>
                    ) : (
                      <></>
                    )}
                    {!ctxState.config.tools ||
                    ctxState.config.tools.includes("colResizeDrag") ? (
                      <SwapOutlined
                        style={{
                          cursor: "pointer",
                          paddingLeft: "5px",
                          color: "rgb(54, 122, 228)",
                        }}
                        onClick={onHandleAutoComputedWidth}
                      />
                    ) : (
                      <></>
                    )}
                    {!ctxState.config.tools ||
                    ctxState.config.tools.includes("colSync") ? (
                      <SettingOutlined
                        style={{
                          cursor: "pointer",
                          paddingLeft: "5px",
                          color:
                            permissions & SYNC
                              ? "rgb(54, 122, 228)"
                              : "#e1e1e1",
                        }}
                        onClick={() => {
                          setPermissions((permissions) => permissions ^ SYNC);
                        }}
                      />
                    ) : (
                      <></>
                    )}
                  </>
                ) : (
                  <></>
                )}
              </div>
            </div>
          ) : (
            <></>
          )}
        </>
        {checkData?.length ? (
          <div
            style={{
              overflow: "auto",
              border: "1px solid rgba(229, 229, 229, 1)",
              borderRadius: "2px",
            }}
          >
            <div
              style={{
                position: "sticky",
                top: 0,
                zIndex: 499,
                color: "rgba(0, 0, 0, 0.85)",
                background: "#fff",
                fontSize: "14px",
                borderBottom: "1px solid rgba(229, 229, 229, 1)",
              }}
            >
              {table.getHeaderGroups().map((headerGroup, index) => (
                <div
                  key={headerGroup.id + "-hg-" + index}
                  style={{
                    display: "flex",
                    height: "36px",
                    alignItems: "center",
                  }}
                >
                  <SortableContext
                    items={columnOrder}
                    strategy={horizontalListSortingStrategy}
                  >
                    {headerGroup.headers.map((header, index) => (
                      <DraggableTableHeader
                        key={header.id + "-h-" + index}
                        table={table}
                        onAscSort={onAscSort}
                        onDescSort={onDescSort}
                        expand={ctxState.config.expand}
                        headerStyle={headerStyle}
                        hasSyncPermission={hasSyncPermission}
                        onTableSync={onTableSync}
                        colSortable={colSortable}
                        onHeaderResizeStart={onHeaderResizeStart}
                        onHeaderResizeEnd={onHeaderResizeEnd}
                        columnResizeMode={columnResizeMode}
                        header={header}
                        depthSize={ctxState.config.depthSize}
                      ></DraggableTableHeader>
                    ))}
                  </SortableContext>
                </div>
              ))}
            </div>
            <div
              style={{
                height: `calc(${style?.height} - 130px)`,
                // overflowY: "auto",
                width: "100%",
              }}
            >
              {filterModel === "selected"
                ? table.getSelectedRowModel().rows.map((row, index) => {
                    return (
                      <Fragment key={row.id + "-ms-" + index}>
                        <div
                          id={
                            (row.original as Record<string, string>)[
                              ctxState.config.rowKey || ""
                            ]
                          }
                          className={`a-syn-row ${rowClassName}`}
                          style={{
                            display: "flex",
                            background: clickedRows.includes(
                              (row.original as Record<string, unknown>)[
                                ctxState.config.rowKey || ""
                              ]
                            )
                              ? rowClickedBackground ||
                                "rgba(54, 122, 228, 0.35)"
                              : row.getIsSelected()
                              ? rowSelectedBackground ||
                                "rgba(54, 122, 228, 0.15)"
                              : "",
                            ...rowStyle?.(row.original, row.index),
                          }}
                          onClick={() => onHandleClickRow(row.original)}
                        >
                          {row.getVisibleCells().map((cell, index) => (
                            <SortableContext
                              key={cell.id + "-s-" + index}
                              items={columnOrder}
                              strategy={horizontalListSortingStrategy}
                            >
                              <DragAlongCell<T>
                                key={cell.id + "-d-" + index}
                                cell={cell}
                                expand={ctxState.config.expand}
                              />
                            </SortableContext>
                          ))}
                        </div>
                        {row.getIsExpanded() && (
                          <>{renderSubComponent({ row })}</>
                        )}
                      </Fragment>
                    );
                  })
                : table.getRowModel().rows.map((row, index) => {
                    return (
                      <Fragment key={row.id + "-m-" + index}>
                        <div
                          id={
                            (row.original as Record<string, string>)[
                              ctxState.config.rowKey || ""
                            ]
                          }
                          className={`a-syn-row ${rowClassName}`}
                          style={{
                            display: "flex",
                            background: clickedRows.includes(
                              (row.original as Record<string, unknown>)[
                                ctxState.config.rowKey || ""
                              ]
                            )
                              ? rowClickedBackground ||
                                "rgba(54, 122, 228, 0.35)"
                              : row.getIsSelected()
                              ? rowSelectedBackground ||
                                "rgba(54, 122, 228, 0.15)"
                              : "",
                            ...rowStyle?.(row.original, row.index),
                          }}
                          onClick={() => onHandleClickRow(row.original)}
                        >
                          {row.getVisibleCells().map((cell, index) => (
                            <SortableContext
                              key={cell.id + "-s-" + index}
                              items={columnOrder}
                              strategy={horizontalListSortingStrategy}
                            >
                              <DragAlongCell<T>
                                key={cell.id + "-d-" + index}
                                cell={cell}
                                expand={ctxState.config.expand}
                              />
                            </SortableContext>
                          ))}
                        </div>
                        {row.getIsExpanded() && (
                          <>{renderSubComponent({ row })}</>
                        )}
                      </Fragment>
                    );
                  })}
            </div>
          </div>
        ) : (
          <div
            style={{
              overflow: "hidden",
              padding: "5px",
              fontSize: "50px",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",

              border: "1px solid rgba(54, 122, 228, 0.3)",
              borderRadius: "2px",
              ...style,
              width: `calc(100% - 10px)`,
              height: `calc(${style?.height} - 100px)`,
            }}
          >
            <Empty></Empty>
          </div>
        )}

        {ctxState.config.hideFooter ? (
          <></>
        ) : !customPagination ? (
          <>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                padding: "5px",
              }}
            >
              <div
                style={{
                  fontSize: "14px",
                }}
              >
                {ctxState.config.footer?.includes("total") ||
                !ctxState.config.footer ? (
                  <>
                    <span>总计</span>
                    <span>
                      {filterModel === "none"
                        ? total || Number(table.getRowCount().toLocaleString())
                        : Object.keys(rowSelection).length}
                    </span>
                  </>
                ) : (
                  <></>
                )}
              </div>
              <Pagination
                size="small"
                total={total || Number(table.getRowCount().toLocaleString())}
                showSizeChanger={
                  ctxState.config.footer?.includes("size") ||
                  !ctxState.config.footer
                }
                showQuickJumper={
                  ctxState.config.footer?.includes("jump") ||
                  !ctxState.config.footer
                }
                current={table.getState().pagination.pageIndex + 1}
                pageSize={table.getState().pagination.pageSize}
                onChange={(pageIndex, pageSize) => {
                  table.setPageIndex(pageIndex - 1);
                  table.setPageSize(pageSize);
                }}
              />
            </div>
          </>
        ) : (
          <></>
        )}
      </div>
    </DndContext>
  );
};
