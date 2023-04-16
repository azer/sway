import { WorkspaceFocusRegion } from 'features/Workspace/focus'
import { RootState } from 'state'
import { SidebarContent } from './focus'

export function isOpen(state: RootState): boolean {
  return state.focus.workspace.sidebar.isOpen
}

export function getContent(state: RootState): SidebarContent {
  return state.focus.workspace.sidebar.content
}

export function getFocusedUserId(state: RootState): string | undefined {
  return getContent(state) === SidebarContent.User && isOpen(state)
    ? state.focus.workspace.sidebar.user?.id
    : undefined
}

export function hasContent(state: RootState): boolean {
  const content = state.focus.workspace.sidebar.content
  if (content === SidebarContent.User) {
    return !!state.focus.workspace.sidebar.user?.id
  }

  if (
    content === SidebarContent.Chat ||
    content === SidebarContent.StatusUpdates
  ) {
    return true
  }

  if (content === SidebarContent.Room) {
    return !!state.focus.workspace.sidebar.room?.id
  }

  return state.focus.workspace.sidebar.isOpen
}

export function isFocusOnSidebar(state: RootState): boolean {
  return state.focus.workspace.region === WorkspaceFocusRegion.Sidebar
}

export function getRoomIdOnSidebar(state: RootState): string | undefined {
  return (
    (isOpen(state) &&
      getContent(state) === SidebarContent.Room &&
      state.focus.workspace.sidebar.room?.id) ||
    undefined
  )
}
