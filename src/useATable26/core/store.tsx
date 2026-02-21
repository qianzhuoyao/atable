export type Unsubscribe = () => void;

export type StoreApi<S> = {
  getState: () => S;
  setState: (updater: S | ((prev: S) => S), replace?: boolean) => void;
  subscribe: (listener: () => void) => Unsubscribe;
};

export function createStore<S>(initialState: S): StoreApi<S> {
  let state = initialState;
  const listeners = new Set<() => void>();

  const getState = () => state;

  const setState: StoreApi<S>["setState"] = (updater, replace) => {
    const next =
      typeof updater === "function" ? (updater as (p: S) => S)(state) : updater;

    // replace=false 时做浅合并（你也可以改成深合并）
    state = replace ? next : ({ ...(state as S), ...(next as S) } as S);

    listeners.forEach((l) => l());
  };

  const subscribe: StoreApi<S>["subscribe"] = (listener) => {
    listeners.add(listener);
    return () => listeners.delete(listener);
  };

  return { getState, setState, subscribe };
}
