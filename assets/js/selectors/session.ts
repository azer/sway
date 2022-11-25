import { RootState } from 'state'

export function getUserId(state: RootState): string | undefined {
  return state.session.id
}

export function isLoggedIn(state: RootState): boolean {
  return !!state.session.token
}
