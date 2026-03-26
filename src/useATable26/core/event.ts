import { Subject } from "rxjs";

type IEventParams<T> = { payload: T; tag: string };

export const eventObservable = new Subject<IEventParams<any>>();

export const eventEmit = <T>(tag: string, payload: T) => {
  eventObservable.next({ tag, payload });
};
export const eventSubscribe = <T>(
  subscribe: (params: IEventParams<T>) => void,
) => {
  return eventObservable.subscribe(subscribe);
};
