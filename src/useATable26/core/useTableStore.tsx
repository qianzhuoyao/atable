import { useContext } from "react";
import type { State } from "./type";
import { Ctx } from "./Ctx";

export function useTableStore<T>(
  sel: (s: State) => T,
  eq?: (a: T, b: T) => boolean,
) {
  const b = useContext(Ctx);
  if (!b)
    throw new Error("useTableStore must be used inside TableProvider");
  return b.useStore(sel, eq);
}
