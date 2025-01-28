import {
  shallowEqual,
  TypedUseSelectorHook,
  useDispatch as useGenericDispatch,
  useSelector as useGenericSelector,
} from 'react-redux'
import type { AppDispatch, RootState } from './store'

export * as entities from './entities'
export type { AppDispatch, RootState } from './store'

export const useDispatch = () => useGenericDispatch<AppDispatch>()
export const useSelector: TypedUseSelectorHook<RootState> = (
  selector,
  customCompareFn
) => useGenericSelector(selector, customCompareFn || shallowEqualForList)

export function shallowEqualForList<T>(a: T, b: any): boolean {
  if (!Array.isArray(a) || !Array.isArray(b)) return shallowEqual(a, b)

  if (a.length !== b.length) return false

  const len = a.length
  let i = -1
  while (i++ < len) {
    if (!shallowEqual(a[i], b[i])) {
      return false
    }
  }

  return true
}
