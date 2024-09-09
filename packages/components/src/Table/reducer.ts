import { Dispatch, createContext, useContext } from "react";
import { IATableConfig } from "./type.ts";

interface ITableInitState {
  config: IATableConfig;
  tag?: string;
}

type ITableAction = updateConfig | updateTableTag;

interface updateConfig {
  type: "updateConfig";
  payload: IATableConfig;
}

interface updateTableTag {
  type: "updateTableTag";
  payload?: string;
}

interface ITableContext {
  state: ITableInitState;
  dispatch: Dispatch<ITableAction>;
}

export const initialTableState: ITableInitState = {
  config: {},
  tag: void 0,
};

export const TableContext = createContext<ITableContext>({
  state: initialTableState,
  dispatch: () => {},
});

export const TableReducer = (state: ITableInitState, action: ITableAction) => {
  const { type, payload } = action;

  switch (type) {
    case "updateTableTag":
      return {
        ...state,
        tag: payload,
      };
    case "updateConfig":
      return {
        ...state,
        config: payload,
      };
    default:
      throw new Error(`No case for type ${type} found in ruler.`);
  }
};
export const useTableContext = () => {
  return useContext(TableContext);
};
