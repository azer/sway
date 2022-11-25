import { createSlice, PayloadAction } from '@reduxjs/toolkit'
import { AppDispatch, RootState } from 'app/state'
import { initialShellFocus, ShellFocus } from 'features/Shell/focus'

export const name = 'focus'

interface State {
  windowHasFocus: boolean
  shell: ShellFocus
}

export const initialState: State = {
  windowHasFocus: document.hasFocus(),
  shell: initialShellFocus,
}

export const slice = createSlice({
  name,
  initialState,
  reducers: {
    setWindowFocus: (state, action: PayloadAction<boolean>) => {
      state.windowHasFocus = action.payload
    },
    setShellFocus: (state, action: PayloadAction<ShellFocus>) => {
      state.shell = action.payload
    },
  },
})

export const { setWindowFocus, setShellFocus } = slice.actions
export default slice.reducer

export function updateShellFocus(
  updateFn: (draft: ShellFocus, getState: () => RootState) => void
) {
  return (dispatch: AppDispatch, getState: () => RootState) => {
    const current = getState().focus.shell
    const draft = JSON.parse(JSON.stringify(current))

    updateFn(draft, getState)
    dispatch(setShellFocus(draft))
  }
}
