import { useContext } from "react";
import { Ctx } from "./Ctx";

export function useTableActions() {
  const b = useContext(Ctx);
  if (!b)
    throw new Error("useTableActions must be used inside TableProvider");
  return b.actions;
}
