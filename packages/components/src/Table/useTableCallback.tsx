import { useCallback, useMemo, useRef } from "react";
import { IEffect, IKeyOfEffect } from "./type";
import { getCallbackName } from "./constant";

export const useTableCallback = <T,>() => {
  const callbackRef = useRef<{
    m: Partial<{ [p in IKeyOfEffect<T>]: IEffect<T>[p] }>;
  }>({
    m: {},
  });

  const setRef = useCallback(
    <F extends IKeyOfEffect<T>>(name: F, cb: IEffect<T>[F]) => {
      callbackRef.current.m[name] = cb;
    },
    []
  );

  const callback_unstable = useMemo(() => {
    const callback: Partial<{
      [p in IKeyOfEffect<T>]: (cb: IEffect<T>[p]) => void;
    }> = {};

    getCallbackName<T>().map((name) => {
      callback[name] = (cb) => setRef(name, cb);
    });

    return callback;
  }, [setRef]);

  return { callback_unstable, callbackRef };
};
