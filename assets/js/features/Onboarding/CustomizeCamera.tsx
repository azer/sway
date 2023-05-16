import { styled } from 'themes'
import React, { useEffect, useState, useCallback, useRef, useMemo } from 'react'
import selectors from 'selectors'
import DailyIframe, { DailyCall } from '@daily-co/daily-js'
import {
  StepContent,
  StepDesc,
  StepGrid,
  StepSection,
  StepTitle,
} from 'components/Onboarding'

import { OnboardingButtonset } from 'components/Onboarding/Buttonset'
import { CurrentStep } from './CurrentStep'
import { useSelector, useDispatch } from 'state'
import { logger } from 'lib/log'
import { DailyProvider } from '@daily-co/daily-react-hooks'
import { HaircheckVideo } from './Video'
import { CameraSwitcher } from './CameraSwitcher'
import { BlurSlider } from './BlurSlider'
import { BackgroundSelector } from './BackgroundSelector'

const log = logger('onboarding/choose-camera')

interface Props {
  done: () => void
  back?: () => void
}

export function CustomizeCamera(props: Props) {
  const [callObject, setCallObject] = useState<DailyCall | null>(null)

  const [workspace] = useSelector((state) => [
    selectors.workspaces.getSelfWorkspace(state),
  ])

  const startHairCheck = useCallback(async (url: string) => {
    log.info('Starting hair check')
    const newCallObject = DailyIframe.createCallObject()

    newCallObject
      .on('loading', logEvent)
      .on('loaded', logEvent)
      .on('left-meeting', logEvent)
      .on('started-camera', logEvent)
      .on('track-started', logEvent)
      .on('track-stopped', logEvent)
      .on('camera-error', logEvent)
      .on('joining-meeting', logEvent)
      .on('joined-meeting', logEvent)
      .on('participant-updated', logEvent)
      .on('participant-joined', logEvent)
      .on('participant-left', logEvent)
      .on('active-speaker-change', logEvent)
      .on('error', logEvent)
      .on('network-connection', logEvent)

    //setRoomUrl(roomUrl)
    setCallObject(newCallObject)
    await newCallObject.preAuth({ url })
    await newCallObject.startCamera()

    log.info('Hair check started')
  }, [])

  useEffect(() => {
    if (!workspace) return
    startHairCheck(workspace.daily_room_url)
  }, [startHairCheck, !!workspace])

  return (
    <StepGrid>
      <StepSection>
        <StepContent>
          <CurrentStep />
          <StepTitle>Set your scene</StepTitle>
          <StepDesc>
            Pick your camera and add a personal touch with blur and background
            color. Or, feel free to use Sway camera-free.
          </StepDesc>
        </StepContent>
        <OnboardingButtonset done={props.done} back={props.back} label="Next" />
      </StepSection>
      <StepSection>
        <StepContent>
          {callObject ? (
            <DailyProvider callObject={callObject}>
              <CameraConfig>
                <Preview>
                  <HaircheckVideo />
                  <Placeholder>Camera off</Placeholder>
                </Preview>
                <CameraSwitcher />
                <BackgroundSelector />
                <BlurSlider />
              </CameraConfig>
            </DailyProvider>
          ) : null}
        </StepContent>
      </StepSection>
    </StepGrid>
  )
}

export const CameraConfig = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  width: '100%',
  round: 'large',
  height: '100%',
  background: 'rgba(238, 239, 242)',
  padding: '20px',
  border: '3px solid $onboardingStepBg',
  outline: '1px solid rgba(238, 239, 242)',
})

export const Preview = styled('div', {
  width: 'calc(100% + 20px)',
  marginTop: '-10px',
  marginLeft: '-10px',
  aspectRatio: '1.25 / 1',
  background: 'rgba(100, 124, 129, 0.2)',
  round: 'medium',
  color: '$red',
  position: 'relative',
  overflow: 'hidden',
})

export const Placeholder = styled('div', {
  zIndex: '$base',
  height: '100%',
  center: true,
  fontSize: '$small',
  color: '$red',
})

function logEvent(e: any) {
  log.info('Daily event: %s', e.action, e)
}
