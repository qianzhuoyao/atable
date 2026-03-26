import { useMemo } from "react";
import { createStore } from "./store";
import { createUseStore } from "./useStore";
import type { State, StoreBundle } from "./type";
import { Ctx } from "./Ctx";

const InitState: State = {
  columnOrder: [],
};

export const TableProvider = ({ children }: { children: React.ReactNode }) => {
  const bundle = useMemo<StoreBundle>(() => {
    const api = createStore<State>(InitState);
    const useStore = createUseStore(api);

    const actions = {
      setColumnOrder(columnOrder: State["columnOrder"]) {
        api.setState((pre) => ({ ...pre, columnOrder }));
      },
    };

    return { api, useStore, actions };
  }, []);

  return <Ctx.Provider value={bundle}>{children}</Ctx.Provider>;
};
