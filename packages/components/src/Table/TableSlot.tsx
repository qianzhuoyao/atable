import {
  CSSProperties,
  Fragment,
  HTMLProps,
  memo,
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
  expand,
}: {
  table: Table<T>;
  expand?: boolean;
}) => {
  console.log("table.getIsAllRowsSelected()");

  return (
    <>
      <IndeterminateCheckbox
        {...{
          checked: table.getIsAllRowsSelected(),
          indeterminate: table.getIsSomeRowsSelected(),
          onChange: table.getToggleAllRowsSelectedHandler(),
        }}
      />
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
            <ArrowDownOutlined />
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

const ColVisibleContent = <T,>({ table }: { table: Table<T> }) => {
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
      {table.getAllLeafColumns().map((column) => {
        if (column.id === SELECT_KEY) {
          return <Fragment key={column.id}></Fragment>;
        }
        return (
          <div key={column.id}>
            <label>
              <input
                {...{
                  type: "checkbox",
                  checked: column.getIsVisible(),
                  onChange: column.getToggleVisibilityHandler(),
                }}
              />
              {typeof column.columnDef.header === "function"
                ? column.columnDef.header?.({
                    column,
                    header: {},
                    table,
                  } as any)
                : column.columnDef.header}
            </label>
          </div>
        );
      })}
    </>
  );
};

const DraggableTableHeader = <T,>({
  header,
  table,
  headerStyle,
  columnResizeMode,
  onHeaderResizeStart,
  expand,
  onHeaderResizeEnd,
}: {
  header: Header<T, unknown>;
  table: Table<T>;
  expand?: boolean;
  headerStyle?: (prop: string) => CSSProperties;
  columnResizeMode: ColumnResizeMode;
} & Pick<IEffect<T>, "onHeaderResizeStart" | "onHeaderResizeEnd">) => {
  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useSortable({
      id: header.column.id,
    });
  console.log(isDragging, "isDragging");
  const style: CSSProperties = {
    position: "relative",
    transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    cursor: isDragging ? "pointer" : "",
    whiteSpace: "nowrap",
    width: header.column.getSize(),
    zIndex: isDragging ? 4 : 0,
  };

  const onHandleResizeOver = useCallback(() => {
    onHeaderResizeEnd?.(header.id);
  }, [header.id, onHeaderResizeEnd]);

  const onHandleResizeTouchHandler = useCallback<
    React.TouchEventHandler<HTMLDivElement>
  >(
    (e) => {
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
      e.preventDefault();
      const resizeHandler = header.getResizeHandler();
      resizeHandler(e);
      onHeaderResizeStart?.(header.id);
    },
    [header, onHeaderResizeStart]
  );
  console.log(table.getExpandedDepth(), "getExpandedDepth");
  return (
    <div
      {...attributes}
      {...(header.column.id !== SELECT_KEY ? listeners : {})}
      ref={setNodeRef}
      key={header.id}
      style={{
        ...(header.column.id !== SELECT_KEY ? style : { zIndex: 200 }),
        height: "100%",
        position: header.id === SELECT_KEY ? "sticky" : "relative",
        left: header.id === SELECT_KEY ? "0px" : "0px",
        background: "rgba(245, 248, 253, 1)",
        display: "flex",
        alignItems: "center",
      }}
    >
      <div
        className="a-syn-truncate"
        style={{
          height: "100%",
          minWidth:
            header.column.id !== SELECT_KEY
              ? header.getSize()
              : table.getExpandedDepth() * 15 + DEFAULT_SELECT_WIDTH,
          display: "flex",
          alignItems: "center",
          justifyContent:
            header.column.id === SELECT_KEY && !expand ? "center" : "",
          position: "relative",
          ...headerStyle?.(header.column.id),
        }}
      >
        {header.isPlaceholder
          ? null
          : flexRender(header.column.columnDef.header, header.getContext())}
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
  onSelectChange,
  onHeaderMoveEnd,
  onHeaderMoveStart,
  onHeaderResizeEnd,
  onHeaderResizeStart,
  onRefreshCallback,
  onPageChange,
  onRowClick,
}: {
  tableState: ITableParams<T>;
} & Omit<IEffect<T>, "setUpdate">) => {
  const selectedRef = useRef<{
    //跨业选中
    pageCache: RowSelectionState;
    //跨业所有数据
    pageList: Record<string, T[]>;
  }>({
    pageCache: {},
    pageList: {},
  });
  const { state: ctxState } = useTableContext();
  const [columnSizing, setColumnSizing] = useState({});
  const [clickedRows, setClickedRows] = useState<unknown[]>([]);
  const [filterModel, setFilterModel] = useState<"none" | "selected">("none");
  const [columnVisibility, setColumnVisibility] = useState({});
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [permissions, setPermissions] = useState(DRAGGABLE | RESIZABLE);
  const {
    col,
    data,
    pageIndex,
    pageSize,
    total,
    setData,
    selectedRowKeyList,
    clickedRowKeyList,
    cellStyle,
    headerStyle,
    loading,
    style,
  } = tableState;

  const columns = useMemo(() => {
    if (ctxState.config.selectModel) {
      if (
        col &&
        (col[0] as { accessorKey: string }).accessorKey !== SELECT_KEY
      ) {
        col.unshift({
          id: SELECT_KEY,
          accessorKey: SELECT_KEY,
          size: DEFAULT_SELECT_WIDTH,
          header: ({ table }) => (
            <HeaderCheckBox<T>
              table={table}
              expand={ctxState.config.expand}
            ></HeaderCheckBox>
          ),
          cell: ({ row }) => (
            <div
              style={{
                paddingLeft: `${row.depth * 15}px`,
              }}
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <IndeterminateCheckbox
                  {...{
                    checked:
                      row.getIsSelected() || row.getIsAllSubRowsSelected(),
                    indeterminate: row.getIsSomeSelected(),
                    onChange: row.getToggleSelectedHandler(),
                  }}
                />

                {ctxState.config.expand && row.getCanExpand() ? (
                  <div
                    {...{
                      onClick: row.getToggleExpandedHandler(),
                      style: { cursor: "pointer" },
                    }}
                  >
                    {row.getIsExpanded() ? (
                      <ArrowDownOutlined />
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
  }, [col, ctxState.config.expand, ctxState.config.selectModel]);

  const [expanded, setExpanded] = useState<ExpandedState>({});
  const [columnResizeMode] = useState<ColumnResizeMode>("onChange");
  const [columnResizeDirection] = useState<ColumnResizeDirection>("ltr");
  const [columnOrder, setColumnOrder] = useState<string[]>(() =>
    columns.map((c) => c.id || "")
  );

  useEffect(() => {
    //数据数量不对则放弃
    if (data?.length === pageSize) {
      selectedRef.current.pageList[String(pageIndex)] = data;
    }
  }, [data, pageIndex, pageSize]);

  useEffect(() => {
    setData(() => {
      console.log(
        filterModel,
        pageIndex,
        selectedRef.current.pageList,
        selectedRef.current.pageList[String(pageIndex)],
        "pageListpageIndexss"
      );
      if (filterModel === "selected") {
        return Object.values(selectedRef.current.pageList).reduce(
          (a, b) => a.concat(b),
          []
        );
      } else {
        return selectedRef.current.pageList[String(pageIndex)];
      }
    });
  }, [filterModel, pageIndex, setData]);

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
      zIndex: isDragging ? 4 : 0,
    };
    console.log(cell, table.getExpandedDepth(), "cellcell");
    return (
      <div
        key={cell.id}
        ref={setNodeRef}
        className="a-syn-cell"
        style={{
          ...(cell.column.id !== SELECT_KEY ? style : { zIndex: 90 }),
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
        {flexRender(cell.column.columnDef.cell, cell.getContext())}
      </div>
    );
  };

  const table = useReactTable({
    data,
    columns,
    state: {
      columnVisibility,
      rowSelection,
      columnOrder,
      columnSizing,
      expanded,
    },
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
  console.log(
    table.getSelectedRowModel().rows,
    rowSelection,
    "table.getRowModel().rows"
  );

  // useEffect(() => {
  //   // console.log(rowSelection, "rowSelectionsss");
  //   Object.keys(rowSelection).map((id) => {
  //     const row = table.getRowModel().rowsById[id];
  //     console.log(rowSelection, row, expanded, "rowSelectionsss");
  //     if (!ctxState.config.rowKey) {
  //       throw new Error("选取的rowKey值必须存在");
  //     }
  //     if (row) {
  //       selectedRef.current.list.set(
  //         String(
  //           (row.original as Record<string, string>)[
  //             ctxState.config.rowKey || ""
  //           ]
  //         ),
  //         row.original
  //       );
  //     }
  //   });
  // }, [ctxState.config.rowKey, expanded, rowSelection, table]);

  useEffect(() => {
    const tableClickedRowKeyList: unknown[] | undefined =
      typeof clickedRowKeyList === "function"
        ? clickedRowKeyList(table.getRowModel().rows.map((row) => row.original))
        : clickedRowKeyList;

    setClickedRows(() => {
      return tableClickedRowKeyList || [];
    });
  }, [clickedRowKeyList, table]);

  useEffect(() => {
    selectedRef.current.pageCache = {
      ...selectedRef.current.pageCache,
      ...rowSelection,
    };
  }, [rowSelection]);

  useEffect(() => {
    onSelectChange?.(
      Object.keys(selectedRef.current.pageCache).map((key) => {
        return table.getRow(key).original;
      })
    );
  }, [onSelectChange, table]);

  useEffect(() => {
    console.log("d3wdfff");
    const selectRowKeyList: unknown[] | undefined =
      typeof selectedRowKeyList === "function"
        ? selectedRowKeyList(
            table.getRowModel().rows.map((row) => row.original)
          )
        : selectedRowKeyList;

    setRowSelection(() => {
      const key = ctxState.config?.rowKey;
      if (!key) {
        return {};
      }
      const selection: RowSelectionState = {};
      table.getRowModel().rows?.map((row) => {
        if (
          ctxState.config.rowKey &&
          row.original &&
          selectRowKeyList?.includes(
            (row.original as Record<string, unknown>)[key]
          )
        ) {
          selection[
            (row.original as Record<string, string>)[ctxState.config.rowKey]
          ] = true;
        }
      });

      return selection;
    });
  }, [ctxState.config.rowKey, selectedRowKeyList, table]);

  console.log(
    data,
    rowSelection,
    ctxState.config.showTools,
    columnOrder,
    "ctxState.config.showTools"
  );

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
      }
    },
    [onHeaderMoveEnd]
  );

  const onHandleRefresh = useCallback(() => {
    onRefreshCallback?.();
  }, [onRefreshCallback]);

  const handleDragStart = useCallback(
    (event: DragEndEvent) => {
      const { active, over } = event;
      console.log(active, over, "ddddsssss");
      onHeaderMoveStart?.(active.id);
    },
    [onHeaderMoveStart]
  );
  const sensors = useSensors(
    useSensor(MouseSensor, {}),
    useSensor(TouchSensor, {}),
    useSensor(KeyboardSensor, {})
  );
  const onHandleQuitFilter = useCallback(() => {
    setFilterModel("none");
    // setData(() => selectedRef.current.pre);
    // setExpanded(() => selectedRef.current.preExpanded);
    // setRowSelection(() => selectedRef.current.preRowSelection);
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

  console.log(table.getRowModel(), data, "csew3fggf");
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
                        content={<ColVisibleContent table={table} />}
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
                        onClick={() => {}}
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
        {data?.length ? (
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
                zIndex: 99,
                color: "rgba(0, 0, 0, 0.85)",
                background: "#fff",
                fontSize: "14px",
                borderBottom: "1px solid rgba(229, 229, 229, 1)",
              }}
            >
              {table.getHeaderGroups().map((headerGroup) => (
                <div
                  key={headerGroup.id}
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
                    {headerGroup.headers.map((header) => (
                      <DraggableTableHeader
                        key={header.id}
                        table={table}
                        expand={ctxState.config.expand}
                        headerStyle={headerStyle}
                        onHeaderResizeStart={onHeaderResizeStart}
                        onHeaderResizeEnd={onHeaderResizeEnd}
                        columnResizeMode={columnResizeMode}
                        header={header}
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
              {table.getRowModel().rows.map((row) => {
                return (
                  <div
                    key={row.id}
                    className="a-syn-row"
                    style={{
                      display:
                        filterModel === "selected" &&
                        !(
                          row.getIsAllSubRowsSelected() ||
                          row.getIsSomeSelected() ||
                          row.getIsSelected()
                        )
                          ? "none"
                          : "flex",
                      background: clickedRows.includes(
                        (row.original as Record<string, unknown>)[
                          ctxState.config.rowKey || ""
                        ]
                      )
                        ? "rgba(54, 122, 228, 0.35)"
                        : row.getIsSelected()
                        ? "rgba(54, 122, 228, 0.15)"
                        : "",
                    }}
                    onClick={() => onHandleClickRow(row.original)}
                  >
                    {row.getVisibleCells().map((cell) => (
                      <SortableContext
                        key={cell.id}
                        items={columnOrder}
                        strategy={horizontalListSortingStrategy}
                      >
                        <DragAlongCell<T>
                          key={cell.id}
                          cell={cell}
                          expand={ctxState.config.expand}
                        />
                      </SortableContext>
                    ))}
                  </div>
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
        ) : (
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
              <span>总计</span>
              <span>
                {filterModel === "none"
                  ? total
                  : Object.keys(rowSelection).length}
              </span>
            </div>
            <Pagination
              size="small"
              total={total}
              showSizeChanger
              showQuickJumper
              current={pageIndex}
              pageSize={pageSize}
              onChange={(pageIndex, pageSize) =>
                onPageChange({
                  pageIndex,
                  pageSize,
                })
              }
            />
          </div>
        )}
      </div>
    </DndContext>
  );
};
