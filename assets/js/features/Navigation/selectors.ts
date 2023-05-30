import { RootState } from 'state'
import selectors from 'selectors'
import { uniqueItems } from 'lib/utils'

// users I have private rooms with
// online users
// other users in the workspace
// limit: 10
export function listPeople(state: RootState): string[] {
  const localUserId = selectors.session.getUserId(state)
  if (!localUserId) return []

  const workspace = selectors.workspaces.getSelfWorkspace(state)
  if (!workspace) return []

  const usersWithPrivateRooms = selectors.rooms
    .listAllPrivateRooms(state, workspace.id)
    .map(
      (roomId) =>
        selectors.roomMembers
          .getMembersByRoomId(state, roomId)
          .filter((userId) => userId !== localUserId)[0]
    )

  const onlineMembers = selectors.memberships
    .listByWorkspaceId(state, workspace.id)
    .map((m) => m.user_id)
    .filter(
      (userId) =>
        userId !== localUserId && selectors.presence.isUserOnline(state, userId)
    )

  const offlineMembers = selectors.memberships
    .listByWorkspaceId(state, workspace.id)
    .map((m) => m.user_id)
    .filter(
      (userId) =>
        userId !== localUserId &&
        !selectors.presence.isUserOnline(state, userId)
    )

  const all = [...onlineMembers, ...usersWithPrivateRooms, ...offlineMembers]

  return uniqueItems(all)
    .sort(selectors.presence.sortUsersByPresence(state))
    .slice(0, 10)
}

export function isUserIn1v1Room(state: RootState, userId: string): boolean {
  const roomId = selectors.rooms.get1v1RoomIdByUserId(state, userId)
  if (!roomId) return false

  const status = selectors.status.getStatusByUserId(state, userId)

  return status.room_id === roomId
}
