import { RootState } from 'state'

export function getCurrentStep(state: RootState): number {
  return state.onboarding.currentStep
}

export function getTotalSteps(state: RootState): number {
  return state.onboarding.totalSteps
}

export function isDone(state: RootState): boolean {
  return state.onboarding.done
}
