import { RootState } from 'app/state'

export function isLoggedIn(state: RootState): boolean {
  //return state.session.loading === Loading.Succeeded && !!state.session.id
  return false
}
