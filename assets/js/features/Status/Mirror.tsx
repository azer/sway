import { styled } from 'themes'
import React from 'react'
import selectors from 'selectors'
import { useSelector } from 'state'
import Avatar from 'components/Avatar'
import { ConnectionState } from './slice'

interface Props {}

export default function Mirror(props: Props) {
  // const dispatch = useDispatch()
  const [user, presence, conn] = useSelector((state) => [
    selectors.users.getSelf(state),
    selectors.status.getSelfPresenceStatus(state),
    selectors.status.getSelfConnectionStatus(state),
  ])

  const items = [conn?.bafaSocket, conn?.bafaRoom, conn?.dailyRoom]
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
      <Avatar photoUrl={user?.photoUrl} name={user?.name} round="large" fill />
      <Icon status={status} title={'connection ' + status} />
    </Container>
  )
}

const Container = styled('div', {
  position: 'relative',
  height: '100%',
  aspectRatio: '1 / 1',
})

const Icon = styled('div', {
  position: 'absolute',
  bottom: '0',
  right: '0',
  width: '18px',
  aspectRatio: '1 / 1',
  background: '$statusTrayIconReadyBg',
  border: '2px solid $statusTrayIconBorderColor',
  round: 'circle',
  borderBox: '',
  variants: {
    status: {
      ready: {
        background: '$statusTrayIconReadyBg',
      },
      connecting: {
        background: '$statusTrayIconConnectingBg',
      },
      failed: {
        background: '$statusTrayIconFailedBg',
      },
      successful: {
        background: '$statusTrayIconConnectedBg',
      },
    },
  },
})

function unifiedState() {}
