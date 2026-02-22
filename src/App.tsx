import { useCreateATable } from "./useATable26/core";
import { TableProvider } from "./useATable26/core/context";
import { Pagination } from "./useATable26/core/pagination";
import {
  IndeterminateCheckbox,
  TableTemplate,
} from "./useATable26/core/template";
import { ToolBar } from "./useATable26/core/toolbar";
import {
  useSetTablePagination,
  useSetTableSelection,
} from "./useATable26/hooks";

const Content = () => {
  const [rowSelected, setRowSelected] = useSetTableSelection({});
  const [pagination, setPagination] = useSetTablePagination({
    pageIndex: 0,
    pageSize: 10,
  });
  const table = useCreateATable({
    data: [{ name: "111" }],
    state: {
      selected: rowSelected,
      pagination,
    },
    selection: {
      mode: "multiple",
    },
    columns: [
      {
        id: "select",
        header: ({ table }) => (
          <IndeterminateCheckbox
            {...{
              checked: table.getIsAllRowsSelected(),
              indeterminate: table.getIsSomeRowsSelected(),
              onChange: table.getToggleAllRowsSelectedHandler(),
            }}
          />
        ),
        cell: ({ row }) => (
          <div className="px-1">
            <IndeterminateCheckbox
              {...{
                checked: row.getIsSelected(),
                disabled: !row.getCanSelect(),
                indeterminate: row.getIsSomeSelected(),
                onChange: row.getToggleSelectedHandler(),
              }}
            />
          </div>
        ),
      },
      {
        accessorKey: "name",
        id: "name",
        header: "Name",
        cell: (info) => info.getValue(),
      },
    ],
  });

  return (
    <div className="App" style={{ width: "100vw", height: "100vh" }}>
      <ToolBar></ToolBar>
      <TableTemplate table={table}></TableTemplate>
      <Pagination pagination={pagination}></Pagination>
    </div>
  );
};

function App() {
  return (
    <TableProvider>
      <Content />
    </TableProvider>
  );
}

export default App;
