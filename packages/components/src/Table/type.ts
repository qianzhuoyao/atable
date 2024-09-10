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
  colSortable?: (prop: string) => boolean;
  style?: CSSProperties;
}
