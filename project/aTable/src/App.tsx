import { useATable } from "@ATable/components";
import "./App.css";
import { makeData, Person } from "./makeData";
import { HTMLProps, useEffect, useMemo, useRef, useState } from "react";
const dataList = [makeData(20, 5, 3), makeData(20, 5, 3)];
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

  const [data, setData] = useState(() => dataList[0]);
  const [pageIndex, setPageIndex] = useState(1);
  const [pageSize, setPageSize] = useState(20);
  const { slotBuilder, onSelectChange, onRefreshCallback, onPageChange } =
    useATable<Person>("tag");
  console.log(data, "sfdata");
  onRefreshCallback(() => {
    console.log("reweeeeee");
  });
  onPageChange(({ pageIndex, pageSize }) => {
    setPageIndex(pageIndex);
    setPageSize(pageSize);
    setData(dataList[pageIndex - 1]);
  });
  const table = slotBuilder({
    showTools: true,
    selectModel: true,
    expand: true,
    showSelectedInfo: true,
    rowKey: "id",
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

        data,
        setData,
        col: columns,
        pageSize,
        pageIndex,
        total: 50,
      })}
    </>
  );
}

export default App;
