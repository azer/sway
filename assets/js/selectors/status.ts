import { RootState } from 'state'
import * as entities from 'state/entities'

export function getById(
  state: RootState,
  id: string
): entities.Status | undefined {
  return state.entities.statuses[id]
}
