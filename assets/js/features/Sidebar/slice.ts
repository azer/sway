import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { updateWorkspaceFocus } from 'features/Focus'
import { SidebarContent } from './focus'

export const name = 'sidebar'

interface State {}

export const initialState: State = {}

export const slice = createSlice({
  name,
  initialState,
  reducers: {},
})

//export const {} = slice.actions
export default slice.reducer

export function setSidebarOpen(open: boolean) {
  return updateWorkspaceFocus((focus) => {
    focus.sidebar.isOpen = open
  })
}

export function openUserSidebar(userId: string) {
  return updateWorkspaceFocus((focus) => {
    focus.sidebar.content = SidebarContent.User
    focus.sidebar.isOpen = true
    focus.sidebar.user = {
      id: userId,
    }
  })
}
