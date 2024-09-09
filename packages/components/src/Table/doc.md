# ATable（MwTable2）

> 一个使用 useTable 与 react 构建的 table 组件
>
> - useTable >8
> - react >16
> - typescript >5

---

## 开始

- 安装:

  ```sh
  pnpm add -w components
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
      selectModel: "single",
    });
    //此函数执行于effect，所以初始会执行两次
    onSelectChange((selectedItems) => {
      setSelect(selectedItems);
    });
    onRefreshCallback(() => {});

    return (
      <>
        {mwTable({
          data,
          col,
          select,
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

允许使用hook方式构建表格

使用useATable的方式创建

useATable接受一个参数tag,类似于nameSpace，tag的变更会导致表格变更

slotBuilder 允许构建一个涵盖配置的函数，其可以返回一个表格

构建一个表格，其单选，并且行标识为id
这个rowKey 在操作行时是必须的
  const mwTable = slotBuilder({
      selectModel: "single",
      rowKey:'id'
    });
mwTable是一个表格的状态构建，其接受一个对象
export interface ITableParams<T> {
  data: T[];
  col: ICol<T>;
  pageIndex: number;
  pageSize: number;
  total: number;
}

col
export interface ICol<T> {
  //字段
  field: string;
  //均分
  flex:number;
  //宽度 优先级比flex高
  width?:string;
  //表头渲染
  headerRenderer: () => ReactNode;
  //单元格渲染
  cellRenderer: (row: T) => ReactNode;
}

使用 ITableParams 类型内的值可以更新表格的数据与任意状态
xxx
return <>{mwTable()}</>

```

```tsx
const { slotBuilder, onRefreshCallback, onSelected, setSelected } =
  useATable("tag");
```
