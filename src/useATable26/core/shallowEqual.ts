export function shallowEqualObj(a: Record<string, unknown>, b: Record<string, unknown>) {
  if (Object.is(a, b)) return true;
  if (!a || !b) return false;
  const ak = Object.keys(a);
  const bk = Object.keys(b);
  if (ak.length !== bk.length) return false;
  for (const k of ak) if (!Object.is(a[k], b[k])) return false;
  return true;
}