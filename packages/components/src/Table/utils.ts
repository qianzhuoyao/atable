// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function deepEqual(obj1: any, obj2: any): boolean {
  // 如果是基本类型，用 === 比较
  if (obj1 === obj2) return true;

  // 如果其中一个是 null 或者它们的类型不同，返回 false
  if (obj1 == null || obj2 == null || typeof obj1 !== typeof obj2) return false;

  // 如果是数组，长度不同直接返回 false
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) return false;

    // 递归比较数组的每个元素
    for (let i = 0; i < obj1.length; i++) {
      if (!deepEqual(obj1[i], obj2[i])) return false;
    }

    return true;
  }

  // 如果是对象，比较对象的键和值
  if (typeof obj1 === "object" && typeof obj2 === "object") {
    const keys1 = Object.keys(obj1);
    const keys2 = Object.keys(obj2);

    // 如果对象的键数量不同，返回 false
    if (keys1.length !== keys2.length) return false;

    // 递归比较每个键对应的值
    for (const key of keys1) {
      if (!deepEqual(obj1[key], obj2[key])) return false;
    }

    return true;
  }

  // 否则，返回 false（意味着它们不相等）
  return false;
}
