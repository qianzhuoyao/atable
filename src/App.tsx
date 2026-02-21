import { useATable } from "./useATable26/core";
import { TableProvider } from "./useATable26/core/context";
import {
  IndeterminateCheckbox,
  TableTemplate,
} from "./useATable26/core/template";
import { useSetTableSelection } from "./useATable26/hooks";

const Content = () => {
  const [rowSelected, setRowSelected] = useSetTableSelection({});
  const table = useATable({
    data: [{ name: "111" }],
    onSelectionChange: (selected) => {
      setRowSelected(selected);
      console.log("selected", selected);
    },
    state: {
      selected: rowSelected,
    },
    selection: {
      mode: "multiple",
      enabled: true,
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
      <TableTemplate table={table}></TableTemplate>
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
