import { styled } from 'themes'
import React from 'react'
import selectors from 'selectors'
import {
  CallSwitch,
  CustomStyledRoot as SwitchRoot,
  Button as CallSwitchButton,
} from 'features/CallDock/CallSwitch'
import { Button, StyledButton } from 'features/Dock/Button'
// import { useSelector, useDispatch } from 'state'

interface Props {
  isActive: boolean
  cameraOn: boolean
  micOn: boolean
  speakerOn: boolean
  joinCall: () => void
  leaveCall: () => void
  toggleCamera: () => void
  toggleMic: () => void
  toggleSpeaker: () => void
}

export function TrayCallControls(props: Props) {
  // const dispatch = useDispatch()
  // const [] = useSelector((state) => [])

  return (
    <Container>
      <Left>
        <CallSwitch
          isActive={props.isActive}
          joinCall={props.joinCall}
          leaveCall={props.leaveCall}
          naked
        />
      </Left>
      <Right>
        <Button
          label="Camera"
          icon={!props.cameraOn ? 'video-off' : 'video'}
          off={!props.cameraOn}
          tooltipLabel={props.cameraOn ? 'Turn off camera' : 'Turn on camera'}
          onClick={props.toggleCamera}
          naked
        />
        <Button
          label="Microphone"
          icon={!props.micOn ? 'mic-off' : 'mic'}
          off={!props.micOn}
          tooltipLabel={props.micOn ? 'Turn off mic' : 'Turn on mic'}
          onClick={props.toggleMic}
          naked
        />
        <Button
          label="Speaker"
          icon={!props.speakerOn ? 'speaker-off' : 'speaker-volume-high'}
          onClick={props.toggleSpeaker}
          off={!props.speakerOn}
          tooltipLabel={
            props.speakerOn ? 'Turn off speaker' : 'Turn on speaker'
          }
          naked
        />
      </Right>
    </Container>
  )
}

const Container = styled('div', {
  width: 'calc(100vw - 30px)',
  margin: '0 auto',
  display: 'grid',
  gridTemplateColumns: 'auto 120px',
  alignItems: 'center',
  height: '40px',
  gap: '8px',
  borderTop: '1px solid rgba(255, 255, 255, 0.04)',
  padding: '0 12px',
  [`${SwitchRoot}`]: {},
  [`${CallSwitchButton}`]: {
    width: '70px !important',
    background: 'red',
  },
  [`& ${StyledButton}`]: {
    height: '32px',
    background: 'transparent',
    boxShadow: 'none',
    outline: '0',
    border: '0',
    padding: '0',
  },
  [`& ${StyledButton} svg`]: {
    height: '18px',
  },
  ['& ${StyledSwitch}']: {
    gap: '8px',
  },
})

const Left = styled('div', {})

const Right = styled('div', {
  display: 'flex',
  justifyContent: 'end',
  alignItems: 'center',
  height: '32px',
  borderRadius: '$medium',
  gap: '8px',
  [`& ${StyledButton}`]: {
    center: true,
    height: '28px',
    background: 'transparent',
    boxShadow: 'none',
    outline: '0',
    border: '0',
    padding: '0',
    round: 'medium',
  },
  [`& ${StyledButton}:hover`]: {
    background: 'rgba(0, 4, 9, 0.2)',
  },
})
