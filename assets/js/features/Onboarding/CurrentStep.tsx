import { styled } from 'themes'
import React from 'react'
import selectors from 'selectors'
import { useSelector, useDispatch } from 'state'

interface Props {}

export function CurrentStep(props: Props) {
  // const dispatch = useDispatch()
  const [currentStep, totalSteps] = useSelector((state) => [
    selectors.onboarding.getCurrentStep(state),
    selectors.onboarding.getTotalSteps(state),
  ])

  return (
    <Container>
      <label>{currentStep + 1}</label> of <label>{totalSteps}</label>
    </Container>
  )
}

const Container = styled('div', {
  fontSize: '$base',
  color: 'rgb(90, 94, 101)',
  '& label': {
    fontWeight: '$semibold',
  },
})
