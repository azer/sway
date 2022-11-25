import { RootState } from 'state'
import * as entities from 'state/entities'
import selectors from '.'

export function getById(
  state: RootState,
  id: string
): entities.Org | undefined {
  return state.entities.orgs[id]
}

export function getSelfOrg(state: RootState): entities.Org | undefined {
  const user = selectors.users.getSelf(state)
  return user && getById(state, user.orgId)
}
