import { ICallbackName } from "./type";

export const CALLBACK_NAME: ICallbackName<unknown> = [
  "onRefreshCallback",
  "onHeaderResizeStart",
  "onHeaderResizeEnd",
  "onHeaderMoveStart",
  "onHeaderMoveEnd",
  "onSelectChange",
  "onRowClick",
  "onPageChange",
  "onTableSync",
  "onDescSort",
  "onHandleSelect",
  "onAscSort",
  "onColVisibleChange",
] as const;

export const getCallbackName = <T>(): ICallbackName<T> => {
  return CALLBACK_NAME;
};
