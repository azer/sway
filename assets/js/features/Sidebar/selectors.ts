import { RootState } from 'state'
import { SidebarContent } from './focus'

export function isOpen(state: RootState): boolean {
  return state.focus.workspace.sidebar.isOpen
}

export function getContent(state: RootState): SidebarContent {
  return state.focus.workspace.sidebar.content
}

export function getFocusedUserId(state: RootState): string | undefined {
  return state.focus.workspace.sidebar.user?.id
}

export function hasContent(state: RootState): boolean {
  const content = state.focus.workspace.sidebar.content
  if (content === SidebarContent.User) {
    return !!state.focus.workspace.sidebar.user?.id
  }

  return false
}
