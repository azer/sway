import { styled } from 'themes'
import React, { useEffect } from 'react'
import selectors from 'selectors'
import { ShellRoot } from 'features/Shell/ShellRoot'
import { useSelector, useDispatch } from 'state'
import { RequestAccess } from './RequestAccess'
import { TrafficLight, TrafficLights } from 'features/Navigation'
import { logger } from 'lib/log'
import { setCurrentStep, setDone, setTotalSteps } from './slice'
import { CustomizeCamera } from './CustomizeCamera'
import { CustomizeAudio } from './CustomizeAudio'
import { Download } from './Download'
import { isElectron } from 'lib/electron'
import { useNavigate } from 'react-router-dom'

const log = logger('onboarding')

interface Props {}

export function Onboarding(props: Props) {
  const dispatch = useDispatch()
  const navigate = useNavigate()

  const [currentStep, totalSteps, workspace, room] = useSelector((state) => [
    selectors.onboarding.getCurrentStep(state),
    selectors.onboarding.getTotalSteps(state),
    selectors.workspaces.getSelfWorkspace(state),
    selectors.rooms.getDefaultRoom(state),
  ])

  let steps: ((_: any) => JSX.Element)[] = [
    RequestAccess,
    CustomizeCamera,
    CustomizeAudio,
  ]

  if (!isElectron) {
    steps = [Download].concat(steps)
  }

  useEffect(() => {
    dispatch(setTotalSteps(steps.length))
  }, [steps.length])

  const StepView = steps[currentStep]

  return (
    <ShellRoot>
      {isElectron ? (
        <Titlebar>
          <TrafficLights>
            <TrafficLight fill />
            <TrafficLight fill />
            <TrafficLight fill />
          </TrafficLights>
        </Titlebar>
      ) : null}
      <OnboardingRoot>
        <Step>
          {StepView ? (
            <StepView
              back={currentStep !== 0 ? prevStep : undefined}
              done={nextStep}
            />
          ) : (
            'something went wrong'
          )}
        </Step>
      </OnboardingRoot>
    </ShellRoot>
  )

  function nextStep() {
    if (currentStep + 1 < totalSteps - 1) {
      dispatch(setCurrentStep(currentStep + 1))
    } else {
      dispatch(setDone(true))
      log.info('Onboarding done, redirecting user to workspace')
      navigate(`/${workspace?.slug}/room/${room?.slug}`)
    }
  }

  function prevStep() {
    if (currentStep > 0) {
      dispatch(setCurrentStep(currentStep - 1))
    }
  }
}

const Step = styled('div', {
  borderRadius: '$xlarge',
  aspectRatio: '1.6 / 1',
  maxWidth: 'calc(100vw - 150px)',
  maxHeight: 'calc(100vh - 150px)',
  width: '95vw',
  background: '$onboardingStepBg',
  border: '2px solid $onboardingStepBorder',
  '@l': {
    width: '1100px',
  },
})

const gradient = [
  `radial-gradient(circle at 0% 60%, $onboardingBgGradient1Start, $onboardingBgGradient1End 30%)`,
  `radial-gradient(
      circle at 20% 100%,
      $onboardingBgGradient2Start 10%,
      $onboardingBgGradient2End 50%
    )`,
  `radial-gradient(
      circle at 70% 100%,
      $onboardingBgGradient3Start,
      $onboardingBgGradient3End 45%
    )`,
  `radial-gradient(
      circle at 100% 60%,
      $onboardingBgGradient4Start,
      $onboardingBgGradient1End 95%
    )`,
]

const OnboardingRoot = styled('div', {
  backgroundColor: 'rgb(220, 224, 230)',
  backgroundImage: gradient.join(','),
  width: '100vw',
  height: '100vh',
  center: true,
  '*::selection': {
    background: 'rgba(119, 119, 119, 0.15)',
    color: 'rgba(0, 0, 0, 0.5)',
  },
})

const Titlebar = styled('header', {
  position: 'absolute',
  top: '0',
  left: '0',
  width: '100%',
  height: '48px',
  '-webkit-app-region': 'drag',
})
