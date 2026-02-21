// use-store.ts
import { useSyncExternalStore } from "react";
import type { StoreApi } from "./store";

function defaultEq<T>(a: T, b: T) {
  return Object.is(a, b);
}

export function createUseStore<S>(api: StoreApi<S>) {
  return function useStore<T>(
    selector: (s: S) => T,
    isEqual: (a: T, b: T) => boolean = defaultEq
  ): T {
    // useSyncExternalStore 要求：snapshot 读出来要稳定
    let last: T;
    let inited = false;

    const getSnapshot = () => {
      const next = selector(api.getState());
      if (!inited) {
        inited = true;
        last = next;
        return next;
      }
      if (isEqual(last!, next)) return last!;
      last = next;
      return next;
    };

    return useSyncExternalStore(api.subscribe, getSnapshot, getSnapshot);
  };
}
