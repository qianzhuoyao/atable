import { UniqueIdentifier } from "@dnd-kit/core";
import { ColumnDef } from "@tanstack/react-table";
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

export interface IEffect<T> {
  onRefreshCallback: () => void;
  onSelectChange: (targetRows: T[]) => void;
  onHeaderResizeStart: (prop: string) => void;
  onHeaderResizeEnd: (prop: string) => void;
  onHeaderMoveStart: (prop: UniqueIdentifier) => void;
  onHeaderMoveEnd: (prop: UniqueIdentifier) => void;
  onPageChange: (updateParams: { pageIndex: number; pageSize: number }) => void;
  onTableSync: (syncTableColInfo: IColInfo[]) => void;
  onRowClick: (row: T) => void;
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
  depthSize?:number;
  showTools?: boolean;
  tools?: (typeof TOOLS)[number][];
  showSelectedInfo?: boolean;
  hideFooter?: boolean;
  footer?: (typeof FOOTER)[number][];
}

export interface ITableParams<T> {
  data: T[];
  setData: React.Dispatch<React.SetStateAction<T[]>>;
  col: ColumnDef<T>[];
  pageIndex: number;
  pageSize: number;
  loading?: boolean;
  total: number;
  clickedRowKeyList?: (() => (string | undefined)[]) | (string | undefined)[];
  selectedRowKeyList?: (() => (string | undefined)[]) | (string | undefined)[];
  cellStyle?: <F>(prop: string, row: F) => CSSProperties;
  headerStyle?: (prop: string) => CSSProperties;
  rowStyle?: (row: T, index: number) => CSSProperties;
  colSortable?: (prop: string) => boolean;
  popupColHidden?: (prop: string) => boolean;
  rowSelectDisable?: (row: T) => boolean;
  customExpand?: (params: {
    type: "isHead" | "isLeaf";
    collapsed: boolean;
  }) => ReactNode;
  style?: CSSProperties;
}
