import { useMemo } from "react";
import { createStore } from "./store";
import { createUseStore } from "./useStore";
import type { State, StoreBundle } from "./type";
import { Ctx } from "./Ctx";

const InitState: State = {
  columnOrder: [],
  columnFilters: [],
  columnPinning: {},
  sorting: [],
  expanded: {},
  pagination: {
    pageIndex: 0,
    pageSize: 20,
  },
  grouping: [],
  rowPinning: {},
  columnVisibility: {},
  selected: {},
};

export const TableProvider = ({ children }: { children: React.ReactNode }) => {
  const bundle = useMemo<StoreBundle>(() => {
    const api = createStore<State>(InitState);
    const useStore = createUseStore(api);
    const patch = (p: State) => api.setState(p); // 你自己的 store setState

    const actions = {
      patch,
      setColumnPinning(columnPinning: State["columnPinning"]) {
        api.setState((pre) => ({ ...pre, columnPinning }));
      },
      setColumnFilters(columnFilters: State["columnFilters"]) {
        api.setState((pre) => ({ ...pre, columnFilters }));
      },
      setGrouping(grouping: State["grouping"]) {
        api.setState((pre) => ({ ...pre, grouping }));
      },
      setSorting(sorting: State["sorting"]) {
        api.setState((pre) => ({ ...pre, sorting }));
      },
      setSelected(selected: State["selected"]) {
        api.setState((pre) => ({ ...pre, selected }));
      },
      setRowPinning(rowPinning: State["rowPinning"]) {
        api.setState((pre) => ({ ...pre, rowPinning }));
      },
      setPagination(pagination: State["pagination"]) {
        api.setState((pre) => ({ ...pre, pagination }));
      },
      setExpanded(expanded: State["expanded"]) {
        api.setState((pre) => ({ ...pre, expanded }));
      },
      setColumnVisibility(columnVisibility: State["columnVisibility"]) {
        api.setState((pre) => ({ ...pre, columnVisibility }));
      },
      setColumnOrder(columnOrder: State["columnOrder"]) {
        api.setState((pre) => ({ ...pre, columnOrder }));
      },
    };

    return { api, useStore, actions };
  }, []);

  return <Ctx.Provider value={bundle}>{children}</Ctx.Provider>;
};
