import { ColumnDef, VisibilityState } from "@tanstack/react-table";
import { useMemo } from "react";

interface ITargetCol {
  field: string;
  flex: number;
  id: number;
  moduleKey: string;
  visible: boolean;
}

function arrayToMap<A extends object>(
  p1: A[],
  p2: keyof A
): [Map<A[keyof A], A>, A[keyof A][]] {
  const resultMap = new Map<A[keyof A], A>();
  const indexMap: A[keyof A][] = [];
  p1.forEach((item) => {
    const key = item[p2];
    indexMap.push(key);
    resultMap.set(key, { ...item });
  });

  return [resultMap, indexMap];
}
export const useMergeCol = <T,>(
  targetCol: ITargetCol[],
  sourceCol: ColumnDef<T>[]
) => {
  return useMemo(() => {
    const sourceMap = arrayToMap<ColumnDef<T>>(sourceCol, "id");
    const map = arrayToMap<ITargetCol>(targetCol, "field");
    console.log(map, sourceMap, "iskoww");
    const visibilityList: VisibilityState = {};
    const result: ColumnDef<T>[] = [];
    map?.[1]?.map((id) => {
      const sourceItem = sourceMap?.[0]?.get(id);
      if (sourceItem) {
        const targetColItem = map?.[0]?.get(id);
        if (targetColItem && typeof id == "string") {
          visibilityList[id] = !!targetColItem.visible;
          result.push({
            ...sourceItem,
            size: targetColItem.flex,
          });
        }
      }
      return sourceItem;
    });
    return {
      col: result,
      visibilityList,
    };
  }, [sourceCol, targetCol]);
};
