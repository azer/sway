import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export const name = 'onboarding'

interface State {
  done: boolean
  totalSteps: number
  currentStep: number
}

export const initialState: State = {
  done: false,
  totalSteps: 5,
  currentStep: 0,
}

export const slice = createSlice({
  name,
  initialState,
  reducers: {
    setDone: (state, action: PayloadAction<boolean>) => {
      state.done = action.payload
    },
    setCurrentStep: (state, action: PayloadAction<number>) => {
      state.currentStep = action.payload
    },
    setTotalSteps: (state, action: PayloadAction<number>) => {
      state.totalSteps = action.payload
    },
  },
})

export const { setCurrentStep, setDone, setTotalSteps } = slice.actions
export default slice.reducer
