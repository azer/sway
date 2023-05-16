import { styled } from 'themes'
import React, { useEffect, useState } from 'react'
import ReactDOM from 'react-dom'
import { HandleButton } from './Handle'
import { Icon } from 'components/Icon'
import { Tooltip } from 'components/Tooltip'
import { TooltipProvider } from '@radix-ui/react-tooltip'
import { TrayWindowState } from 'features/ElectronTray'
import { logger } from 'lib/log'
import {
  ElectronMessage,
  getIpcRenderer,
  messageMainWindow,
  messageWindowManager,
} from 'lib/electron'
import { UserIconView } from 'components/UserView'
import { BoxTile } from 'components/BoxTile'
import { PipCallProvider } from './PipCallProvider'
// import selectors from 'selectors'
// import { useSelector, useDispatch } from 'state'

const log = logger('electron-pip-window')

interface Props {}

export function ElectronPipWindow(props: Props) {
  const [pipState, setPipState] = useState<TrayWindowState>({})
  const [videoFrame, setVideoFrame] = useState<
    Record<string, { ts: number; frame: string }>
  >({})

  useEffect(() => {
    log.info('Listen messages')

    getIpcRenderer()?.on('message', onMessage)
    messageMainWindow({ requestState: true })

    return () => {
      getIpcRenderer()?.removeListener('message', onMessage)
    }
  }, [])

  const self = pipState.participants?.find((p) => p.isSelf)
  const active =
    pipState.participants?.filter((p) => p.isActive && !p.isSelf) || []

  return (
    <TooltipProvider>
      {pipState.workspace ? (
        <PipCallProvider
          userId={pipState.localUser?.id}
          roomUrl={pipState.workspace?.daily_room_url}
        >
          <Container onDoubleClick={showMainWindow}>
            <Handle>
              <HandleButton />
            </Handle>
            <Call>
              <BoxTile numBoxes={active.length + (self ? 1 : 0)}>
                {self ? (
                  <UserIconView
                    userId={self.userId}
                    user={self.user}
                    status={self.status}
                    small={active.length > 0}
                    tap={tap}
                    isOnline={self.isOnline}
                    createStatusHook={createStatusHook}
                    videoParticipantId={
                      self.participant?.cameraOn
                        ? self.participant?.dailyUserId
                        : undefined
                    }
                    self
                    tile
                  />
                ) : null}
                {active.map((p) => (
                  <UserIconView
                    userId={p.userId}
                    user={p.user}
                    status={p.status}
                    small={active.length > 0}
                    tap={tap}
                    isOnline={p.isOnline}
                    createStatusHook={createStatusHook}
                    videoParticipantId={
                      p.participant?.cameraOn
                        ? p.participant?.dailyUserId
                        : undefined
                    }
                    tile
                  />
                ))}
              </BoxTile>
            </Call>
            <Buttonset>
              <Tooltip content={'Turn off video'}>
                <Button
                  onClick={toggleCamera}
                  on={pipState.localStatus?.camera_on || false}
                >
                  <Icon
                    name={
                      pipState.localStatus?.camera_on ? 'video' : 'videoOff'
                    }
                  />
                </Button>
              </Tooltip>
              <Tooltip content={'Turn off microphone'}>
                <Button
                  onClick={toggleMic}
                  on={pipState.localStatus?.mic_on || false}
                >
                  <Icon
                    name={pipState.localStatus?.mic_on ? 'mic' : 'micOff'}
                  />
                </Button>
              </Tooltip>
              <Tooltip content={'Hang up call'}>
                <HangUpButton onClick={leaveCall}>
                  <Icon name="phoneHangUp" />
                </HangUpButton>
              </Tooltip>
            </Buttonset>
          </Container>
        </PipCallProvider>
      ) : null}
    </TooltipProvider>
  )

  function onMessage(event: Event, msg: ElectronMessage) {
    log.info('Received message', msg)
    //const parsed = JSON.parse(message) as ElectronMessage

    if (msg.payload.provideState) {
      setPipState(msg.payload.provideState.state)
      return
    }

    if (msg.payload.sendVideoFrame) {
      const userId = msg.payload.sendVideoFrame?.userId
      if (!userId) return

      setVideoFrame((videoFrames) => {
        return {
          ...videoFrames,
          [userId]: {
            frame: msg.payload.sendVideoFrame?.base64Image,
            ts: Date.now(),
          },
        }
      })
    }

    if (msg.payload.sendTrack) {
      return
    }

    log.error('Unhandled message:', msg)
  }

  function tap(userId: string) {
    messageMainWindow({
      tap: {
        userId,
      },
    })
  }

  function createStatusHook(targetUserId: string) {
    messageMainWindow({
      createStatusHook: {
        targetUserId,
      },
    })
  }

  function toggleCamera() {
    sendToggleCommand('setCameraOn', !pipState.localStatus?.camera_on)
  }

  function toggleMic() {
    sendToggleCommand('setMicOn', !pipState.localStatus?.mic_on)
  }

  function leaveCall() {
    messageMainWindow({ leaveCall: true })
  }

  function sendToggleCommand(cmd: string, value: boolean) {
    messageMainWindow({
      [cmd]: {
        on: value,
      },
    })
  }

  function showMainWindow() {
    console.log('show main window')
    messageWindowManager({ showMainWindow: true })
  }
}

const Container = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  width: '100vw',
  height: '100vh',
  background: '$electronPipContainerBg',
  round: 'large',
})

const Call = styled('div', {
  display: 'flex',
  flexGrow: '1',
  background: '$electronPipCallBg',
  round: 'large',
  height: 'calc(100% - 40px)',
  color: '$electronPipCallFg',
  padding: '20px',
  fontSize: '$small',
  scrollbar: { y: true },
})

const Handle = styled('div', {
  center: true,
  height: '30px',
  color: '$electronPipHandleFg',
  cursor: 'move',
  '-webkit-app-region': 'drag',
})

const Buttonset = styled('div', {
  width: '100%',
  height: '48px',
  center: true,
  flexDirection: 'row',
  gap: '8px',
})

const Button = styled('div', {
  width: '32px',
  height: '32px',
  color: '$electronPipButtonFg',
  center: true,
  round: 'medium',
  '& svg': {
    height: '18px',
    aspectRatio: '1',
  },
  '&:hover': {
    background: '$electronPipButtonHoverBg',
    color: '$electronPipButtonHoverFg',
  },
  variants: {
    on: {
      true: {
        color: '$electronPipOnButtonFg',
      },
    },
  },
})

const HangUpButton = styled(Button, {
  color: '$electronPipHangUpButtonFg',
  '& svg': {
    height: '21px',
  },
  '&:hover': {
    color: '$electronPipHangUpButtonFg',
  },
})

ReactDOM.render(<ElectronPipWindow />, document.getElementById('root'))
