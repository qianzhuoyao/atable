export function applyUpdater<T>(u: T | ((old: T) => T), old: T): T {
   return typeof u === "function" ? (u as (o: T) => T)(old) : u;
}