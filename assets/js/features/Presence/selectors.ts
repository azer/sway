import { WorkspaceFocusRegion } from 'features/Workspace/focus'
import selectors from 'selectors'
import { RootState } from 'state'
import { Status } from 'state/entities'

export function isSpaceButtonEnabled(state: RootState): boolean {
  return (
    state.focus.workspace.region === WorkspaceFocusRegion.Room &&
    !state.focus.workspace.room.dock
  )
}

export function isUserOnline(state: RootState, userId: string): boolean {
  const workspaceId = selectors.workspaces.getFocusedWorkspaceId(state)
  return (
    state.presence.onlineUsersByWorkspaceId[workspaceId]?.includes(userId) ||
    false
  )
}

export function getOnlineUsersInFocusedRoom(state: RootState): string[] {
  const roomId = selectors.rooms.getFocusedRoomId(state)
  return state.presence.onlineUsersByRoomId[roomId]
}

export function getOnlineUsersInWorkspace(state: RootState): string[] {
  const workspaceId = selectors.workspaces.getFocusedWorkspaceId(state)
  return state.presence.onlineUsersByWorkspaceId[workspaceId] || []
}

export function sortUsersByPresence(
  state: RootState
): (userA: string, userB: string) => number {
  const onlineMap = createOnlineUsersMap(state)

  return function (a: string, b: string): number {
    if (onlineMap[a] && !onlineMap[b]) return -1
    if (!onlineMap[a] && onlineMap[b]) return 1
    return 0
  }
}

function createOnlineUsersMap(state: RootState): Record<string, boolean> {
  const onlineMap: Record<string, boolean> = {}
  for (const id of state.userSocket.onlineUsers) {
    onlineMap[id] = true
  }

  return onlineMap
}
