import { styled } from 'themes'
import React from 'react'
import selectors from 'selectors'
import { useSelector } from 'state'
import { ConnectionState, PresenceMode } from './slice'
import { useLocalParticipant } from '@daily-co/daily-react-hooks'
import Video from 'features/Call/Video'
import { AvatarView } from 'features/Avatar/AvatarView'

interface Props {}

export function Mirror(props: Props) {
  // const dispatch = useDispatch()
  const [user, presence, conn, isCameraOff] = useSelector((state) => [
    selectors.users.getSelf(state),
    selectors.dock.getSelfPresenceStatus(state),
    selectors.dock.getSelfConnectionStatus(state),
    selectors.settings.isVideoInputOff(state),
  ])

  const localParticipant = useLocalParticipant()

  const items = [conn?.bafaSocket, conn?.bafaRoom, conn?.dailyCall]
  let status: string = ConnectionState.Ready

  if (conn && items.some((c) => !c || c === ConnectionState.Ready)) {
    status = ConnectionState.Ready
  } else if (conn && items.some((c) => c === ConnectionState.Connecting)) {
    status = ConnectionState.Connecting
  } else if (conn && items.some((c) => c === ConnectionState.Failed)) {
    status = ConnectionState.Failed
  } else if (conn && items.some((c) => c === ConnectionState.Timeout)) {
    status = ConnectionState.Failed
  } else if (conn && items.every((c) => c === ConnectionState.Successful)) {
    status = ConnectionState.Successful
  } else {
    status = 'unknown'
  }

  return (
    <Container>
      {localParticipant &&
      presence?.mode === PresenceMode.Active &&
      !isCameraOff ? (
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
        status={status}
        title={'Connection:' + status}
        small={
          presence?.mode === PresenceMode.Active &&
          status === ConnectionState.Successful
        }
      />
    </Container>
  )
}

const Container = styled('div', {
  position: 'relative',
  height: '100%',
  aspectRatio: '1 / 1',
})

const SelfVideo = styled('div', {
  height: '100%',
  aspectRatio: '1 / 1',
  overflow: 'hidden',
  round: 'large',
  center: true,
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
      successful: {
        background: '$dockIconConnectedBg',
      },
    },
  },
})

function unifiedState() {}
