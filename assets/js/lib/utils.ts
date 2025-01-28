export function uniqueItems<T extends string | number>(array: T[]): T[] {
  return Array.from(new Set(array))
}
