import { styled } from 'themes'
import React from 'react'
import selectors from 'selectors'
import { useSelector } from 'state'
import { ConnectionState } from './slice'
import { useDaily, useLocalParticipant } from '@daily-co/daily-react-hooks'
import Video from 'features/Call/Video'
import { AvatarView } from 'features/Avatar/AvatarView'
import { useVideoSettings } from 'features/Settings/VideoSettings'
import { PresenceMode } from 'state/entities'

interface Props {}

export function Mirror(props: Props) {
  // const dispatch = useDispatch()
  const [user, isActive, isOnSocialMode, conn, isCameraOff] = useSelector(
    (state) => [
      selectors.users.getSelf(state),
      selectors.presence.getSelfStatus(state).is_active,
      selectors.presence.getSelfStatus(state).status === PresenceMode.Social,
      selectors.dock.getSelfConnectionStatus(state),
      selectors.settings.isVideoInputOff(state),
    ]
  )

  const localParticipant = useLocalParticipant()
  const cameraSettings = useVideoSettings()

  const items = [
    conn?.bafaSocket,
    conn?.bafaRoom,
    conn?.dailyCall,
    conn?.internet,
  ]
  let status: string = ConnectionState.Ready

  if (conn && items.some((c) => !c || c === ConnectionState.Ready)) {
    status = ConnectionState.Ready
  } else if (conn && items.some((c) => c === ConnectionState.Connecting)) {
    status = ConnectionState.Connecting
  } else if (conn && items.some((c) => c === ConnectionState.Failed)) {
    status = ConnectionState.Failed
  } else if (conn && items.some((c) => c === ConnectionState.Timeout)) {
    status = ConnectionState.Failed
  } else if (conn && items.every((c) => c === ConnectionState.Connected)) {
    status = ConnectionState.Connected
  } else {
    status = 'unknown'
  }

  return (
    <Container onClick={cameraSettings.open}>
      {localParticipant && (isActive || isOnSocialMode) && !isCameraOff ? (
        <SelfVideo>
          <Video id={localParticipant.session_id} />
        </SelfVideo>
      ) : (
        <AvatarView
          photoUrl={user?.photoUrl}
          name={user?.name}
          round="large"
          fill
        />
      )}
      <ConnectionIcon status={status} title={'Connection:' + status} small />
    </Container>
  )
}

const Container = styled('div', {
  position: 'relative',
  height: '100%',
  aspectRatio: '1 / 1',
  '& img': {
    boxShadow: 'rgb(0 0 0 / 20%) 0px 0px 4px',
  },
})

const SelfVideo = styled('div', {
  height: '100%',
  aspectRatio: '1 / 1',
  overflow: 'hidden',
  round: 'large',
  center: true,
  boxShadow: 'rgb(0 0 0 / 20%) 0px 0px 4px',
  '& video': {
    width: 'auto',
    height: '100%',
  },
})

const ConnectionIcon = styled('div', {
  position: 'absolute',
  bottom: '0',
  right: '0',
  width: '18px',
  aspectRatio: '1 / 1',
  background: '$dockIconReadyBg',
  border: '2px solid $dockIconBorderColor',
  round: 'circle',
  borderBox: '',
  variants: {
    small: {
      true: {
        width: '14px',
      },
    },
    status: {
      ready: {
        background: '$dockIconReadyBg',
      },
      connecting: {
        background: '$dockIconConnectingBg',
      },
      failed: {
        background: '$dockIconFailedBg',
      },
      connected: {
        background: '$dockIconConnectedBg',
      },
    },
  },
})

function unifiedState() {}
