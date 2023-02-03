import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const name = 'command-palette'

interface ModalState {
  icon: string
  isOpen: boolean
  isFullscreen: boolean
  placeholder?: string
  query: string
  selectedId?: string
  value?: unknown
}

interface State {
  modal: ModalState
}

export const initialState: State = {
  modal: {
    icon: '',
    isOpen: false,
    query: '',
    placeholder: '',
    isFullscreen: false,
  },
}

export const slice = createSlice({
  name,
  initialState,
  reducers: {
    open: (state, action: PayloadAction<ModalState>) => {
      state.modal = {
        ...state.modal,
        ...action.payload,
        isOpen: true,
      }
    },
    close: (state, action: PayloadAction<undefined>) => {
      state.modal = {
        ...initialState.modal,
        isOpen: false,
      }
    },
    setValue: (state, action: PayloadAction<unknown>) => {
      state.modal.value = action.payload
    },
  },
})

export const {} = slice.actions
export default slice.reducer
