import { styled } from 'themes'
import React from 'react'
import selectors from 'selectors'
import { useSelector } from 'state'
import { logger } from 'lib/log'
import { useScreenShare } from '@daily-co/daily-react-hooks'
import { CallTile } from 'features/Call/Tile'

interface Props {
  roomId: string
}

const log = logger('rooms/participant-grid')

export function ParticipantGrid(props: Props) {
  const { isSharingScreen } = useScreenShare()

  const [activeUsers, inactiveUsers] = useSelector((state) => {
    const users = selectors.rooms.getUsersInRoom(state, props.roomId)
    const localUserId = selectors.users.getSelf(state)?.id

    const activeUsers = users
      .filter((uid) => selectors.status.isUserActive(state, uid))
      .filter((userId) => isSharingScreen || userId !== localUserId)

    const inactiveUsers = users
      .filter((uid) => !selectors.status.isUserActive(state, uid))
      .filter((userId) => isSharingScreen || userId !== localUserId)

    return [activeUsers, inactiveUsers]
  })

  const alone = inactiveUsers.length + activeUsers.length === 0

  if (alone) {
    return (
      <InviteForm>{"It's just you right now. Invite some others!"}</InviteForm>
    )
  }

  return (
    <Container>
      {activeUsers.length ? <CallTile ids={activeUsers} /> : null}
      {activeUsers.length === 0 && inactiveUsers.length ? (
        <CallTile ids={inactiveUsers} />
      ) : null}
    </Container>
  )
}

const Container = styled('div', {
  display: 'flex',
  overflow: 'hidden',
  padding: '0 20px',
})

const InviteForm = styled('div', {
  width: '100%',
  center: true,
  label: true,
  color: 'rgba(255, 255, 255, 0.7)',
  ellipsis: true,
})
