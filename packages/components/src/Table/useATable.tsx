import { ReactNode, useCallback, useReducer, useRef } from "react";
import { IATableConfig, ITableParams } from "./type.ts";
import { initialTableState, TableContext, TableReducer } from "./reducer.ts";
import { TableSlot } from "./TableSlot.tsx";
import { useTableCallback } from "./useTableCallback.tsx";

export const useATable = <T,>(tag?: string) => {
  const effectRef = useRef<{
    p: () => ReactNode | null;
  }>({
    p: () => null,
  });
  const [state, dispatch] = useReducer(TableReducer, initialTableState);

  const { callbackRef, callback_unstable } = useTableCallback<T>();

  const TableCreator = useCallback(
    (tableState: ITableParams<T>, config: IATableConfig) => {
      return (
        <TableContext.Provider
          value={{ state: { ...state, tag, config: config }, dispatch }}
        >
          {tableState ? (
            <TableSlot<T>
              tableState={tableState}
              customPagination={effectRef.current.p()}
              {...callbackRef.current.m}
            />
          ) : (
            <></>
          )}
        </TableContext.Provider>
      );
    },
    [callbackRef, state, tag]
  );

  const slotBuilder = useCallback(
    (config: IATableConfig) => {
      return (tableState: ITableParams<T>) => TableCreator(tableState, config);
    },
    [TableCreator]
  );

  const scrollTo = (rowKey: string) => {
    document.getElementById(rowKey)?.scrollIntoView({ behavior: "smooth" });
  };
  const setPagination = useCallback((customPagination: ReactNode) => {
    effectRef.current.p = () => customPagination;
  }, []);

  return {
    slotBuilder,
    setPagination,
    scrollTo,
    ...callback_unstable,
  };
};
