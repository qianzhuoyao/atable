import { UniqueIdentifier } from "@dnd-kit/core";
import { ColumnDef, Row } from "@tanstack/react-table";
import { CSSProperties, ReactNode } from "react";

export const FOOTER = ["jump", "size", "total"] as const;

export const TOOLS = [
  "refresh",
  "colVisible",
  "colResizeDrag",
  "colSync",
] as const;

interface IUpdateParams {
  pageIndex: number;
  pageSize: number;
}

export interface IColInfo {
  field?: string;
  flex: number;
  moduleKey?: string;
  visible: boolean;
}
export interface IHandleSelect<T> {
  status: boolean;
  records: T[];
  current?: T;
}

export type ICallbackName<T> = readonly (keyof Partial<IEffect<T>>)[];

export type IKeyOfEffect<T> = keyof IEffect<T>;

export interface IEffect<T> {
  onRefreshCallback: () => void;
  onSelectChange: (targetRows: T[]) => void;
  onHeaderResizeStart: (prop: string) => void;
  onHeaderResizeEnd: (prop: string) => void;
  onHeaderMoveStart: (prop: UniqueIdentifier) => void;
  onHeaderMoveEnd: (prop: UniqueIdentifier) => void;
  onPageChange: (updateParams: { pageIndex: number; pageSize: number }) => void;
  onTableSync: (syncTableColInfo: IColInfo[]) => void;
  onHandleSelect: (params: IHandleSelect<T>) => void;
  onRowClick: (row: T) => void;
  onColVisibleChange: (colIdList: string[]) => void;
  onDescSort: (prop: string) => void;
  onAscSort: (prop: string) => void;
  //暂不做
  setUpdate: (updateParams: IUpdateParams) => void;
}

export interface IATableConfig {
  selectModel?: boolean;
  expand?: boolean;
  rowKey: string;
  subRowsKey?: string;
  depthSize?: number;
  showTools?: boolean;
  tools?: (typeof TOOLS)[number][];
  showSelectedInfo?: boolean;
  hideFooter?: boolean;
  footer?: (typeof FOOTER)[number][];
  autoPagination?: boolean;
}

export interface ITableParams<T> {
  data: T[];
  col: ColumnDef<T>[];
  pageIndex: number;
  pageSize: number;
  loading?: boolean;
  total?: number;
  //col显示隐藏
  colVisibleColIdList?: (() => (string | undefined)[]) | (string | undefined)[];
  clickedRowKeyList?: (() => (string | undefined)[]) | (string | undefined)[];
  selectedRowKeyList?: (() => (string | undefined)[]) | (string | undefined)[];
  cellStyle?: <F>(prop: string, row: F) => CSSProperties;
  headerStyle?: (prop: string) => CSSProperties;
  collapse?: boolean;
  rowClickedBackground?: string;
  rowSelectedBackground?: string;
  rowStyle?: (row: T, index: number) => CSSProperties;
  rowClassName?: string;
  colSortable?: (prop: string) => boolean;
  popupColHidden?: (prop: string) => boolean;
  rowSelectDisable?: (row: T) => boolean;
  getRowCanExpand?: (row: Row<T>) => boolean;
  renderSubComponent: (props: { row: Row<T> }) => React.ReactElement;
  customExpand?: (params: {
    type: "isHead" | "isLeaf";
    collapsed: boolean;
  }) => ReactNode;
  style?: CSSProperties;
}
