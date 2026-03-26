import {
  flexRender,
  type Cell,
  type Header,
  type HeaderGroup,
  type Row,
} from "@tanstack/react-table";
import {
  SortableContext,
  horizontalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { useMemo, type CSSProperties } from "react";
import { CSS } from "@dnd-kit/utilities";
import { useTableStore } from "./useTableStore";

const ColItem = <T,>({ header }: { header: Header<T, unknown> }) => {
  const { attributes, isDragging, listeners, setNodeRef, transform } =
    useSortable({
      id: header.column.id,
    });

  const size = header.column.getSize();

  const style: CSSProperties = useMemo(
    () => ({
      opacity: isDragging ? 0.8 : 1,
      position: "relative",
      transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
      transition: "width transform 0.2s ease-in-out",
      whiteSpace: "nowrap",
      width: size,
      zIndex: isDragging ? 1 : 0,
    }),
    [size, isDragging, transform],
  );

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
      {header.isPlaceholder
        ? null
        : flexRender(header.column.columnDef.header, header.getContext())}
    </div>
  );
};

const CellNode = <T,>({ cell }: { cell: Cell<T, unknown> }) => {
  const { isDragging, setNodeRef, transform } = useSortable({
    id: cell.column.id,
  });

  const style: CSSProperties = {
    opacity: isDragging ? 0.8 : 1,
    position: "relative",
    transform: CSS.Translate.toString(transform), // translate instead of transform to avoid squishing
    transition: "width transform 0.2s ease-in-out",
    width: cell.column.getSize(),
    zIndex: isDragging ? 1 : 0,
  };

  return (
    <td style={style} ref={setNodeRef}>
      {flexRender(cell.column.columnDef.cell, cell.getContext())}
    </td>
  );
};

const Body = <T,>({ rows }: { rows: Row<T>[] }) => {
  const columnOrder = useTableStore((e) => e.columnOrder);
  return (
    <div>
      {rows.map((row) => (
        <div key={row.id}>
          {row.getVisibleCells().map((cell) => (
            <SortableContext
              key={cell.id}
              items={columnOrder}
              strategy={horizontalListSortingStrategy}
            >
              <CellNode key={cell.id} cell={cell} />
            </SortableContext>
          ))}
        </div>
      ))}
    </div>
  );
};

const Col = <T,>({ headGroup }: { headGroup: HeaderGroup<T>[] }) => {
  const columnOrder = useTableStore((e) => e.columnOrder);
  return (
    <div>
      {headGroup.map((headerGroup) => (
        <div key={headerGroup.id}>
          <SortableContext
            items={columnOrder}
            strategy={horizontalListSortingStrategy}
          >
            {headerGroup.headers.map((header) => (
              <ColItem key={header.id} header={header} />
            ))}
          </SortableContext>
        </div>
      ))}
    </div>
  );
};
export const TableTemplate = <T,>({
  currentPageData,
  headGroup,
}: {
  headGroup: HeaderGroup<T>[];
  currentPageData: Row<T>[];
}) => {
  return (
    <div>
      <Col headGroup={headGroup}></Col>
      <Body rows={currentPageData}></Body>
    </div>
  );
};
