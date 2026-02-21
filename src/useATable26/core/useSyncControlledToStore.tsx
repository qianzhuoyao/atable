// useSyncControlledToStore.ts
import { useEffect, useRef } from "react";
import type { Comparer } from "./type";

// 默认比较：Object.is
const is = Object.is;

/**
 * 把受控的 propsState 同步进 storeState（镜像）
 * - propsState[key] !== undefined 才同步
 * - 用 comparers[key] 判断是否需要写入
 */
export function useSyncControlledToStore<S extends Record<string, unknown>>(
  propsState: Partial<S> | undefined,
  storeState: S,
  setStorePatch: (patch: Partial<S>) => void,
  comparers?: Partial<{ [K in keyof S]: Comparer<S[K]> }>,
) {
  const lastSyncedRef = useRef<Partial<S> | null>(null);

  useEffect(() => {
    if (!propsState) return;

    const patch: Partial<S> = {};

    (Object.keys(propsState) as (keyof S)[]).forEach((k) => {
      const ext = propsState[k];
      if (ext === undefined) return; // 未受控跳过

      const cmp = (comparers?.[k] ?? is) as Comparer<unknown>;
      const cur = storeState[k];

      // ext 与 store 不同才写入
      if (!cmp(ext, cur)) {
        patch[k] = ext;
      }
    });

    const hasPatch = Object.keys(patch).length > 0;
    if (!hasPatch) return;

    if (lastSyncedRef.current) {
      let same = true;
      for (const k of Object.keys(patch) as (keyof S)[]) {
        const cmp = (comparers?.[k] ?? is) as Comparer<unknown>;
        if (!cmp(patch[k], (lastSyncedRef.current as S)[k])) {
          same = false;
          break;
        }
      }
      if (same) return;
    }
    lastSyncedRef.current = patch;

    setStorePatch(patch);
  }, [propsState, storeState, setStorePatch, comparers]);
}
