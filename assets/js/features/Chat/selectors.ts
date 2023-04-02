import { WorkspaceFocusRegion } from 'features/Workspace/focus'
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

export function getFocusedMessageId(state: RootState): string | undefined {
  return (
    (selectors.sidebar.isFocusOnSidebar(state) &&
      getFocus(state)?.message?.id) ||
    undefined
  )
}

export function isFocusOnInput(state: RootState): boolean {
  return (
    selectors.sidebar.isFocusOnSidebar(state) && getFocus(state)?.input === true
  )
}
