import { createContext } from "react";
import type { StoreBundle } from "./type";

export const Ctx = createContext<StoreBundle | null>(null);
