import { styled } from 'themes'
import React, { useEffect, useState } from 'react'
import {
  StepContent,
  StepDesc,
  StepGrid,
  StepSection,
  StepTitle,
} from 'components/Onboarding'
import { CurrentStep } from './CurrentStep'
import { logger } from 'lib/log'
import { OnboardingButtonset } from 'components/Onboarding/Buttonset'
import {
  setAudioInputDeviceId,
  setAudioInputDevices,
  setAudioOutputDevices,
  setVideoInputDeviceId,
  setVideoInputDevices,
} from 'features/Settings/slice'
import { keyframes } from '@stitches/react'
import { isElectron } from 'lib/electron'

const log = logger('onboarding/request-access')

interface Props {
  done: () => void
  back?: () => void
}

interface Access {
  audio: boolean
  video: boolean
  screen?: boolean
}

export function Download(props: Props) {
  const [downloaded, setDownloaded] = useState(false)

  return (
    <StepGrid>
      <StepSection>
        <StepContent>
          <CurrentStep />
          <StepTitle>
            {downloaded ? 'Almost There!' : 'Download Sway'}
          </StepTitle>
          {!downloaded ? (
            <StepDesc>
              Speed up team chats with a handy menubar shortcut. Keep an eye on
              your team call with our mini window, even while multitasking.
            </StepDesc>
          ) : (
            <StepDesc>
              Awesome! Now, just open the downloaded file, install it, and you
              {`'`}ll be set!
            </StepDesc>
          )}
        </StepContent>
        <OnboardingButtonset
          done={handleDownload}
          back={props.back}
          skip={props.done}
          label="Download for Mac"
          skipLabel="Continue on web"
        />
      </StepSection>
      <StepSection>
        <Screenshots>
          <img src="https://cldup.com/XsYxse8H5b.png" />
          <img src="https://cldup.com/FjNyqQiFLv.png" />
        </Screenshots>
      </StepSection>
    </StepGrid>
  )

  function handleDownload() {
    document.location.href = 'https://downloads.sway.so/mac'
    setDownloaded(true)
  }
}

const slideshow = keyframes({
  '0%': { transform: 'translateY(0)', opacity: 0 },
  '5%': { opacity: 1 },
  '45%': { transform: 'translateY(0)', opacity: 1 },
  '47%': { transform: 'translateY(50px)', opacity: '0' },
  '60%': { transform: 'translateY(200px)', opacity: 0 },
  '62%': { transform: 'translateY(300px)', opacity: 0 },
  '100%': { transform: 'translateY(400px)', opacity: 0 },
})

const Screenshots = styled('div', {
  width: 'calc(100% + 60px)',
  marginLeft: '-30px',
  height: '300px',
  position: 'relative',
  overflow: 'hidden',
  img: {
    position: 'absolute',
    top: '0',
    width: '100%',
    animation: `${slideshow} 21s infinite`,
  },
  '& img:nth-child(2)': {
    animationDelay: '11s',
    opacity: '0',
  },
})

export function downloadStepEnabled() {
  return !isElectron
}
