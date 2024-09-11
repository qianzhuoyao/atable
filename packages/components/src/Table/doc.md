# ATable（MwTable2）

> 一个使用 useTable 与 react 构建的 table 组件
>
> - useTable >8
> - react >16
> - typescript >5

---

## 开始

- 安装 components:

  ```sh
  pnpm add -w components

  import { useATable,ColumnDef } from "components";

  ```

- 使用:

  ```tsx
  import { useATable } from "component";

  const Demo = () => {
    const [data, setData] = useState([]);
    const [col, setCol] = useState([]);
    const [pageIndex, setPageIndex] = useState(1);
    const [select, setSelect] = useState([]);
    const [pageSize, setPageSize] = useState(20);
    const { slotBuilder, onRefreshCallback, onSelectChange, setSelected } =
      useATable("tag");

    const mwTable = slotBuilder({
      selectModel: true,
    });
    //此函数执行于effect，所以初始会执行两次
    onSelectChange((selectedItems) => {
      setSelect(selectedItems);
    });
    onRefreshCallback(() => {});

    return (
      <>
        {mwTable({
          //当前页数据
          data,
          //表头
          col,

          setData,
          pageIndex,
          total,
          pageSize,
        })}
      </>
    );
  };
  ```

## API

### useATable

```tsx

使用useATable的方式创建

useATable接受一个参数tag,类似于nameSpace，tag的变更会导致表格变更

slotBuilder 允许构建一个涵盖配置的函数，其可以返回一个表格

构建一个表格，其单选，并且行标识为id
这个rowKey 在操作行时是必须的
  const mwTable = slotBuilder({
      selectModel: true,
      rowKey:'id'
    });
mwTable是一个表格的状态构建，其接受一个对象
export interface ITableParams<T> {
  data: T[];
  setData: React.Dispatch<React.SetStateAction<T[]>>;
  col: ColumnDef<T>[];
  pageIndex: number;
  pageSize: number;
  loading?: boolean;
  total: number;
  clickedRowKeyList?: (() => unknown[]) | unknown[];
  selectedRowKeyList?: (() => unknown[]) | unknown[];
  cellStyle?: <F>(prop: string, row: F) => CSSProperties;
  headerStyle?: (prop: string) => CSSProperties;
  style?: CSSProperties;
}

col
//参照useTable col，
const col=[
   {
        accessorKey: "age",
        id: "age",
        size:200,
        cell: (info) => info.getValue(),
        header: () => "Age",
      },
      xxx
]

使用 ITableParams 类型内的值可以更新表格的数据与任意状态

return <>{mwTable({
        style: {
          height: "500px",
          width: "1000px",
        },
        data,
        setData,
        col: columns,
        pageSize,
        pageIndex,
        total: 50,
      })}</>

```

```tsx
// useATable返回值类型：
export interface IEffect<T> {
  //右上角点击刷新时触发
  onRefreshCallback: () => void;
  //当选子项更改时会触发，由于调用在副作用，所以初始时会执行两次 targetRows =[]
  onSelectChange: (targetRows: T[]) => void;
  //表头Resize开始拖拽，在点击时触发
  onHeaderResizeStart: (prop: string) => void;
  //表头Resize结束
  onHeaderResizeEnd: (prop: string) => void;
  //表头拖拽开始
  onHeaderMoveStart: (prop: UniqueIdentifier) => void;
  //表头拖拽结束
  onHeaderMoveEnd: (prop: UniqueIdentifier) => void;
  // 分页变更
  onPageChange: (updateParams: { pageIndex: number; pageSize: number }) => void;
  //同步打开时 操作表头 resize 与drag都会触发
  onTableSync: (syncTableColInfo: IColInfo[]) => void;
  //行点击
  onRowClick: (row: T) => void;
}
```

slotBuilder 参数

```tsx
export interface IATableConfig {
  //开始选中框
  selectModel?: boolean;
  //允许展开分组
  expand?: boolean;
  //键
  rowKey: string;
  // 分组节点key
  subRowsKey?: string;
  //显示工具
  showTools?: boolean;
  //显示的颗粒度
  tools?: (typeof TOOLS)[number][];
  // 显示选中信息
  showSelectedInfo?: boolean;
  //隐藏footer
  hideFooter?: boolean;
}
```

slotBuilder 返回表格构建函数参数类型

```tsx
export interface ITableParams<T> {
  //当前页数据
  data: T[];
  //data的变更函数，当需要删选数据时需要交给table来处理
  setData: React.Dispatch<React.SetStateAction<T[]>>;
  //列
  col: ColumnDef<T>[];
  //pageIndex
  pageIndex: number;
  //pageSize
  pageSize: number;
  //加载状态
  loading?: boolean;
  //总数
  total: number;
  //点击项
  clickedRowKeyList?: (() => unknown[]) | unknown[];
  //勾选项
  selectedRowKeyList?: (() => unknown[]) | unknown[];
  //单元格样式
  cellStyle?: <F>(prop: string, row: F) => CSSProperties;
  //表头样式
  headerStyle?: (prop: string) => CSSProperties;
  //表格样式，不处理width height
  style?: CSSProperties;
  //行是否禁用
  rowSelectDisable?: (row: T) => boolean;
}
```
