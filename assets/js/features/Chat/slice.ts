import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { updateWorkspaceFocus } from 'features/Focus'
import { WorkspaceFocusRegion } from 'features/Workspace/focus'

export const name = 'chat'

interface State {
  messagesByRoom: { [roomId: string]: string[] }
  draftsByRoom: { [roomId: string]: string }
  lastSeenMessageIdByRoom: { [roomId: string]: string }
}

export const initialState: State = {
  messagesByRoom: {},
  draftsByRoom: {},
  lastSeenMessageIdByRoom: {},
}

export const slice = createSlice({
  name,
  initialState,
  reducers: {
    setDraft: (
      state,
      action: PayloadAction<{ roomId: string; draft: string }>
    ) => {
      state.draftsByRoom[action.payload.roomId] = action.payload.draft
    },
    setLastSeenMessage: (
      state,
      action: PayloadAction<{ roomId: string; messageId: string }>
    ) => {
      state.lastSeenMessageIdByRoom[action.payload.roomId] =
        action.payload.messageId
    },
    setMessages: (
      state,
      action: PayloadAction<{ roomId: string; messages: string[] }>
    ) => {
      state.messagesByRoom[action.payload.roomId] = action.payload.messages
    },
    deleteMessageById: (
      state,
      action: PayloadAction<{ roomId: string; messageId: string }>
    ) => {
      state.messagesByRoom[action.payload.roomId] = state.messagesByRoom[
        action.payload.roomId
      ].filter((id) => id !== action.payload.messageId)
    },
    addNewMessages: (
      state,
      action: PayloadAction<{ roomId: string; messages: string[] }>
    ) => {
      if (state.messagesByRoom[action.payload.roomId]) {
        state.messagesByRoom[action.payload.roomId] = state.messagesByRoom[
          action.payload.roomId
        ].concat(action.payload.messages)
      } else {
        state.messagesByRoom[action.payload.roomId] = action.payload.messages
      }
    },
    addOlderMessages: (
      state,
      action: PayloadAction<{ roomId: string; messages: string[] }>
    ) => {
      if (state.messagesByRoom[action.payload.roomId]) {
        state.messagesByRoom[action.payload.roomId] =
          action.payload.messages.concat(
            state.messagesByRoom[action.payload.roomId]
          )
      } else {
        state.messagesByRoom[action.payload.roomId] = action.payload.messages
      }
    },
  },
})

export const {
  setMessages,
  addNewMessages,
  addOlderMessages,
  setDraft,
  deleteMessageById,
  setLastSeenMessage,
} = slice.actions
export default slice.reducer

export function setFocusOnInput() {
  return updateWorkspaceFocus((focus) => {
    focus.region = WorkspaceFocusRegion.Sidebar
    focus.sidebar.chat = {
      input: true,
    }
  })
}

export function setFocusOnMessage(id: string) {
  return updateWorkspaceFocus((focus) => {
    focus.region = WorkspaceFocusRegion.Sidebar
    focus.sidebar.chat = {
      input: false,
      message: {
        id,
        editing: false,
      },
    }
  })
}
