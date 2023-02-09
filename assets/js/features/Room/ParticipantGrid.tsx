import { styled } from 'themes'
import React, { useEffect, useRef } from 'react'
import selectors from 'selectors'
import { useSelector } from 'state'
import { Border, InactiveParticipant, Participant } from './RoomParticipant'
import { logger } from 'lib/log'
import { useMediaTrack, useScreenShare } from '@daily-co/daily-react-hooks'
import { PresenceMode } from 'state/entities'
import { CallTile } from 'features/Call/Tile'

interface Props {
  roomId: string
}

const log = logger('rooms/participant-grid')

export function ParticipantGrid(props: Props) {
  const { isSharingScreen } = useScreenShare()

  const [activeUsers, inactiveUsers, divide] = useSelector((state) => {
    const users = selectors.rooms.getUsersInRoom(state, props.roomId)
    const localUserId = selectors.users.getSelf(state)?.id

    const activeUsers = users
      .filter(
        (uid) =>
          selectors.presence.getStatusByUserId(state, uid).is_active ||
          selectors.presence.getStatusByUserId(state, uid).status ===
            PresenceMode.Social
      )
      .filter((userId) => isSharingScreen || userId !== localUserId)

    const inactiveUsers = users
      .filter(
        (uid) =>
          !selectors.presence.getStatusByUserId(state, uid).is_active &&
          selectors.presence.getStatusByUserId(state, uid).status !==
            PresenceMode.Social
      )
      .filter((userId) => isSharingScreen || userId !== localUserId)

    return [
      activeUsers,
      inactiveUsers,
      activeUsers.length > 0 && inactiveUsers.length > 0,
    ]
  })

  const alone = inactiveUsers.length + activeUsers.length === 0

  if (alone) {
    return (
      <InviteForm>{"It's just you right now. Invite some others!"}</InviteForm>
    )
  }

  return (
    <Container divide={divide}>
      {activeUsers.length ? <CallTile ids={activeUsers} /> : null}
      {inactiveUsers.length ? (
        <InactiveGrid minimized={divide}>
          {inactiveUsers.map((id) => (
            <Participant key={id} userId={id} />
          ))}
        </InactiveGrid>
      ) : null}
    </Container>
  )
}

const Container = styled('div', {
  display: 'flex',
  space: { inner: [4] },
  gap: '8px',
  height: 'calc(100vh - 200px)',
  overflow: 'hidden',
  variants: {
    divide: {
      true: {
        display: 'grid',
        gridTemplateColumns: 'auto 60px',
        gridColumnGap: '12px',
      },
    },
  },
})

const InviteForm = styled('div', {
  width: '100%',
  height: '100%',
  center: true,
  label: true,
  color: 'rgba(255, 255, 255, 0.7)',
  ellipsis: true,
})

const InactiveGrid = styled('div', {
  variants: {
    minimized: {
      false: {
        width: '100%',
        height: '100%',
        center: true,
        overflow: 'hidden',
      },
      true: {
        width: '100%',
        height: '100%',
        overflowY: 'scroll',
        [`& ${Border}`]: {
          width: '100%',
          [`& ${InactiveParticipant}`]: {
            width: '100%',
            height: 'auto',
          },
          '& footer': {
            display: 'none',
          },
        },
      },
    },
  },
})
