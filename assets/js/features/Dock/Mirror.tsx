import { styled } from 'themes'
import React, { useEffect, useState } from 'react'
import selectors from 'selectors'
import { useSelector } from 'state'
import { ConnectionState } from './slice'
import { useDaily, useLocalParticipant } from '@daily-co/daily-react-hooks'
import { Video } from 'features/Call/Video'
import { AvatarView } from 'features/Avatar/AvatarView'
import { useVideoSettings } from 'features/Settings/VideoSettings'
import { PresenceMode } from 'state/entities'

interface Props {}

export function Mirror(props: Props) {
  const [showStatus, setShowStatus] = useState(true)

  // const dispatch = useDispatch()
  const [user, status, isActive, isOnSocialMode, isCameraOff] = useSelector(
    (state) => [
      selectors.users.getSelf(state),
      selectors.dock.getStatusMessage(state),
      selectors.presence.getSelfStatus(state).is_active,
      selectors.presence.getSelfStatus(state).status === PresenceMode.Social,
      selectors.settings.isVideoInputOff(state),
    ]
  )

  const localParticipant = useLocalParticipant()
  const cameraSettings = useVideoSettings()

  useEffect(() => {
    if (status.status === ConnectionState.Connected) {
      setShowStatus(false)
    } else {
      setShowStatus(true)
    }
  }, [status.status])

  return (
    <Container onClick={cameraSettings.open}>
      <Message status={status.status} visible={showStatus}>
        {status.msg}
      </Message>
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
      <ConnectionIcon
        status={status.status}
        title={'Connection:' + status}
        small
      />
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
      disconnected: {
        background: '$dockIconFailedBg',
      },
      connected: {
        background: '$dockIconConnectedBg',
      },
    },
  },
})

const Message = styled('div', {
  position: 'absolute',
  width: '200px',
  top: '-35px',
  left: 0,
  color: 'rgba(255, 255, 255, 0.35)',
  fontSize: '$small',
  opacity: '0',
  fade: { props: ['opacity'], time: 0.1 },
  label: true,
  variants: {
    visible: {
      true: {
        opacity: '1',
      },
    },
    status: {
      ready: {
        color: '$dockIconReadyBg',
      },
      failed: {
        color: '$dockIconFailedBg',
      },
      disconnected: {
        color: '$dockIconFailedBg',
      },
      connected: {
        color: '$dockIconConnectedBg',
      },
    },
  },
})
