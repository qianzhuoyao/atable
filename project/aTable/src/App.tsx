import { useATable } from "@ATable/components";
import "./App.css";
import { makeData, Person } from "./makeData";
import { HTMLProps, useEffect, useMemo, useRef, useState } from "react";
function App() {
  const columns = useMemo<any[]>(
    () => [
      {
        accessorFn: (row) => row.lastName,
        id: "lastName",
        cell: (info) => info.getValue(),
        header: () => <span>Last Name</span>,
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "age",
        id: "age",

        header: () => "Age",
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "visits",
        id: "visits",
        header: () => <span>Visits</span>,
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "status",
        id: "status",
        header: "Status",
        footer: (props) => props.column.id,
      },
      {
        accessorKey: "progress",
        id: "progress",
        header: "Profile Progress",
        footer: (props) => props.column.id,
      },
    ],
    []
  );

  const [data, setData] = useState(() => makeData(100, 5, 3));
  const { slotBuilder, onSelectChange, onRefreshCallback } =
    useATable<Person>("tag");

  onRefreshCallback(() => {
    console.log("reweeeeee");
  });

  const table = slotBuilder({
    showTools: true,
    selectModel: true,
    expand: true,
    showSelectedInfo: true,
    rowKey: "visits",
  });
  onSelectChange((e) => {
    console.log(e, "defgggggg");
  });
  return (
    <>
      {table({
        style: {
          height: "500px",
          width: "1000px",
        },

        setData,
        data,

        col: columns,
        pageSize: 20,
        pageIndex: 1,
        total: 20,
      })}
    </>
  );
}

export default App;
