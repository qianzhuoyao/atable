import { UniqueIdentifier } from "@dnd-kit/core";
import { ColumnDef } from "@tanstack/react-table";
import { CSSProperties } from "react";

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

export interface IEffect<T> {
  onRefreshCallback: () => void;
  onSelectChange: (targetRows: T[]) => void;
  onHeaderResizeStart: (prop: string) => void;
  onHeaderResizeEnd: (prop: string) => void;
  onHeaderMoveStart: (prop: UniqueIdentifier) => void;
  onHeaderMoveEnd: (prop: UniqueIdentifier) => void;
  onPageChange: (updateParams: { pageIndex: number; pageSize: number }) => void;
  onRowClick: (row: T) => void;
  //暂不做
  setUpdate: (updateParams: IUpdateParams) => void;
}

export interface IATableConfig {
  selectModel?: boolean;
  expand?: boolean;
  rowKey?: string;
  showTools?: boolean;
  tools?: (typeof TOOLS)[number][];
  showSelectedInfo?: boolean;
  hideFooter?: boolean;
}

export interface ITableParams<T> {
  data: T[];
  setData: React.Dispatch<React.SetStateAction<T[]>>;
  col: ColumnDef<T>[];
  pageIndex: number;
  pageSize: number;
  loading?: boolean;
  total: number;
  clickedRowKeyList?: ((row: T[]) => unknown[]) | unknown[];
  selectedRowKeyList?: ((row: T[]) => unknown[]) | unknown[];
  cellStyle?: <F>(prop: string, row: F) => CSSProperties;
  headerStyle?: (prop: string) => CSSProperties;
  style?: CSSProperties;
}
