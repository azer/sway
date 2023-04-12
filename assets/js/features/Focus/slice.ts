import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppDispatch, RootState } from 'app/state'
import { initialWorkspaceFocus, WorkspaceFocus } from 'features/Workspace/focus'
import { logger } from 'lib/log'

export const name = 'focus'

const log = logger('focus/slice')

interface State {
  windowHasFocus: boolean
  windowIsVisible: boolean
  workspace: WorkspaceFocus
}

export const initialState: State = {
  windowHasFocus: document.hasFocus(),
  windowIsVisible: !document.hidden,
  workspace: initialWorkspaceFocus,
}

export const slice = createSlice({
  name,
  initialState,
  reducers: {
    setWindowVisible: (state, action: PayloadAction<boolean>) => {
      state.windowIsVisible = action.payload
    },
    setWindowFocus: (state, action: PayloadAction<boolean>) => {
      state.windowHasFocus = action.payload
    },
    setWorkspaceFocus: (state, action: PayloadAction<WorkspaceFocus>) => {
      state.workspace = action.payload
    },
  },
})

export const { setWindowFocus, setWorkspaceFocus, setWindowVisible } =
  slice.actions
export default slice.reducer

export function updateWorkspaceFocus(
  updateFn: (draft: WorkspaceFocus, getState: () => RootState) => void
) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const current = getState().focus.workspace
    const draft = JSON.parse(JSON.stringify(current))

    updateFn(draft, getState)
    dispatch(setWorkspaceFocus(draft))
  }
}
