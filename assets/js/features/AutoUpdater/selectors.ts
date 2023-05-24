import { RootState } from 'state'
import { Release } from './slice'

export function getNewRelease(state: RootState): Release | null {
  return state.autoUpdater.newRelease
}
