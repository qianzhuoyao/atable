import { ReactNode, useCallback, useReducer, useRef } from "react";
import { IATableConfig, IColInfo, IEffect, ITableParams } from "./type.ts";
import { initialTableState, TableContext, TableReducer } from "./reducer.ts";
import { TableSlot } from "./TableSlot.tsx";
import { UniqueIdentifier } from "@dnd-kit/core";

export const useATable = <T,>(tag?: string) => {
  const effectRef = useRef<{
    m: Partial<IEffect<T>>;
    p: () => ReactNode | null;
  }>({
    m: {},
    p: () => null,
  });
  const [state, dispatch] = useReducer(TableReducer, initialTableState);

  const onRowSelectionChange = useCallback((rows: T[]) => {
    effectRef.current.m.onSelectChange?.(rows);
  }, []);

  const onColHeaderResizeStart = useCallback((prop: string) => {
    effectRef.current.m.onHeaderResizeStart?.(prop);
  }, []);

  const onTableRefreshCallback = useCallback(() => {
    effectRef.current.m.onRefreshCallback?.();
  }, []);

  const onColHeaderResizeEnd = useCallback((prop: string) => {
    effectRef.current.m.onHeaderResizeEnd?.(prop);
  }, []);
  const onTableRowClick = useCallback((row: T) => {
    effectRef.current.m.onRowClick?.(row);
  }, []);
  const onTableColInfoChange = useCallback((info: IColInfo[]) => {
    effectRef.current.m.onTableSync?.(info);
  }, []);
  const onTableAscSort = useCallback((prop: string) => {
    console.log("cweccewcecec");
    effectRef.current.m.onAscSort?.(prop);
  }, []);
  const onTableDescSort = useCallback((prop: string) => {
    effectRef.current.m.onDescSort?.(prop);
  }, []);
  const onTablePageChange = useCallback(
    (pageInfo: { pageSize: number; pageIndex: number }) => {
      effectRef.current.m.onPageChange?.(pageInfo);
    },
    []
  );

  const onColHeaderMoveStart = useCallback((prop: UniqueIdentifier) => {
    effectRef.current.m.onHeaderMoveStart?.(prop);
  }, []);

  const onColHeaderMoveEnd = useCallback((prop: UniqueIdentifier) => {
    effectRef.current.m.onHeaderMoveEnd?.(prop);
  }, []);
  const TableCreator = useCallback(
    (tableState: ITableParams<T>, config: IATableConfig) => {
      return (
        <TableContext.Provider
          value={{ state: { ...state, tag, config: config }, dispatch }}
        >
          {tableState ? (
            <TableSlot<T>
              tableState={tableState}
              onSelectChange={onRowSelectionChange}
              onHeaderResizeStart={onColHeaderResizeStart}
              onHeaderResizeEnd={onColHeaderResizeEnd}
              onHeaderMoveEnd={onColHeaderMoveEnd}
              onHeaderMoveStart={onColHeaderMoveStart}
              onRefreshCallback={onTableRefreshCallback}
              onRowClick={onTableRowClick}
              onPageChange={onTablePageChange}
              onTableSync={onTableColInfoChange}
              onAscSort={onTableAscSort}
              onDescSort={onTableDescSort}
              customPagination={effectRef.current.p()}
            />
          ) : (
            <></>
          )}
        </TableContext.Provider>
      );
    },
    [
      onColHeaderMoveEnd,
      onColHeaderMoveStart,
      onColHeaderResizeEnd,
      onColHeaderResizeStart,
      onRowSelectionChange,
      onTableAscSort,
      onTableColInfoChange,
      onTableDescSort,
      onTablePageChange,
      onTableRefreshCallback,
      onTableRowClick,
      state,
      tag,
    ]
  );

  const slotBuilder = useCallback(
    (config: IATableConfig) => {
      return (tableState: ITableParams<T>) => TableCreator(tableState, config);
    },
    [TableCreator]
  );

  const onRefreshCallback = useCallback(
    (cb: IEffect<T>["onRefreshCallback"]) => {
      effectRef.current.m.onRefreshCallback = cb;
    },
    []
  );

  const onHeaderResizeStart = useCallback(
    (cb: IEffect<T>["onHeaderResizeStart"]) => {
      effectRef.current.m.onHeaderResizeStart = cb;
    },
    []
  );

  const onHeaderResizeEnd = useCallback(
    (cb: IEffect<T>["onHeaderResizeEnd"]) => {
      effectRef.current.m.onHeaderResizeEnd = cb;
    },
    []
  );

  const onHeaderMoveStart = useCallback(
    (cb: IEffect<T>["onHeaderMoveStart"]) => {
      effectRef.current.m.onHeaderMoveStart = cb;
    },
    []
  );

  const onHeaderMoveEnd = useCallback((cb: IEffect<T>["onHeaderMoveEnd"]) => {
    effectRef.current.m.onHeaderMoveEnd = cb;
  }, []);

  const onSelectChange = useCallback((cb: IEffect<T>["onSelectChange"]) => {
    effectRef.current.m.onSelectChange = cb;
  }, []);
  const onRowClick = useCallback((cb: IEffect<T>["onRowClick"]) => {
    effectRef.current.m.onRowClick = cb;
  }, []);
  const setUpdate = useCallback((cb: IEffect<T>["setUpdate"]) => {
    effectRef.current.m.setUpdate = cb;
  }, []);
  const onPageChange = useCallback((cb: IEffect<T>["onPageChange"]) => {
    effectRef.current.m.onPageChange = cb;
  }, []);
  const onTableSync = useCallback((cb: IEffect<T>["onTableSync"]) => {
    effectRef.current.m.onTableSync = cb;
  }, []);
  const onDescSort = useCallback((cb: IEffect<T>["onDescSort"]) => {
    effectRef.current.m.onDescSort = cb;
  }, []);
  const onAscSort = useCallback((cb: IEffect<T>["onAscSort"]) => {
    effectRef.current.m.onAscSort = cb;
  }, []);
  const scrollTo = (rowKey: string) => {
    document.getElementById(rowKey)?.scrollIntoView({behavior: "smooth"});
  };
  const setPagination = useCallback((customPagination: ReactNode) => {
    effectRef.current.p = () => customPagination;
  }, []);

  return {
    slotBuilder,
    setUpdate,
    setPagination,
    scrollTo,
    onHeaderResizeStart,
    onRefreshCallback,
    onHeaderMoveStart,
    onRowClick,
    onDescSort,
    onAscSort,
    onHeaderResizeEnd,
    onHeaderMoveEnd,
    onSelectChange,
    onPageChange,
    onTableSync,
  };
};
