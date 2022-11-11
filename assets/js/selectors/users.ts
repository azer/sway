import { RootState } from 'state'
import * as entities from 'state/entities'

export function getById(
  state: RootState,
  id: string
): entities.User | undefined {
  return state.entities.users[id]
}

export function getSelf(state: RootState): entities.User | undefined {
  return state.session.id ? state.entities.users[state.session.id] : undefined
}
