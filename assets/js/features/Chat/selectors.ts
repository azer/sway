import { SidebarContent } from 'features/Sidebar/focus'
import selectors from 'selectors'
import { RootState } from 'state'
import { ChatFocus } from './focus'

export function getDraftByRoomId(state: RootState, roomId: string): string {
  return state.chat.draftsByRoom[roomId] || ''
}

export function getMessagesByRoomId(
  state: RootState,
  roomId: string
): string[] {
  return state.chat.messagesByRoom[roomId] || []
}

export function getFocus(state: RootState): ChatFocus | undefined {
  return state.focus.workspace.sidebar.chat
}

export function hasFocus(state: RootState): boolean {
  return (
    selectors.sidebar.isFocusOnSidebar(state) &&
    selectors.sidebar.getContent(state) === SidebarContent.Chat
  )
}

export function getFocusedMessageId(state: RootState): string | undefined {
  return hasFocus(state) ? getFocus(state)?.message?.id : undefined
}

export function isFocusOnInput(state: RootState): boolean {
  return hasFocus(state) && getFocus(state)?.input === true
}

export function getLastMessageId(
  state: RootState,
  roomId: string
): string | undefined {
  const all = getMessagesByRoomId(state, roomId)
  return all[all.length - 1]
}

export function getPrevMessageId(
  state: RootState,
  roomId: string
): string | undefined {
  return getNextMessageId(state, roomId, -1)
}

export function getNextMessageId(
  state: RootState,
  roomId: string,
  jumpBy?: number
): string | undefined {
  if (!hasFocus(state)) return

  const list = getMessagesByRoomId(state, roomId)
  const selected = getFocusedMessageId(state)

  if (!selected) return list[list.length - 1]

  const currentIndex = list.indexOf(selected)
  if (currentIndex === -1) {
    return list[list.length - 1]
  }

  const nextIndex = currentIndex + (jumpBy === undefined ? 1 : jumpBy)

  if (nextIndex >= list.length || nextIndex < 0) {
    return
  }

  return list[nextIndex]
}

export function hasUnreadMessage(state: RootState, roomId: string): boolean {
  const lastSeenMessageId = state.chat.lastSeenMessageIdByRoom[roomId]
  const messages = state.chat.messagesByRoom[roomId]

  return (
    messages &&
    messages.length > 0 &&
    messages[messages.length - 1] !== lastSeenMessageId
  )
}

export function hasUnreadMessageInFocusedRoom(state: RootState): boolean {
  const focusedRoomId = selectors.rooms.getFocusedRoom(state)?.id
  return focusedRoomId ? hasUnreadMessage(state, focusedRoomId) : false
}
