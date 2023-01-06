import { styled } from 'themes'
import React from 'react'
import selectors from 'selectors'
import { useSelector } from 'state'
import { Participant } from './RoomParticipant'
import logger from 'lib/log'

interface Props {
  roomId: string
}

const log = logger('rooms/participant-grid')

export function ParticipantGrid(props: Props) {
  // const dispatch = useDispatch()
  // const [] = useSelector((state) => [])

  const [usersInRoom] = useSelector((state) => [
    selectors.rooms
      .getUsersInRoom(state, props.roomId)
      .filter((id) => selectors.users.getSelf(state)?.id !== id),
  ])

  if (!window.navigator.onLine) {
    //return <Error>You're offline.</Error>
  }

  if (usersInRoom.length === 0) {
    return (
      <InviteForm>{"It's just you right now. Invite some others!"}</InviteForm>
    )
  }

  return (
    <Container>
      {usersInRoom.map((id) => (
        <Participant key={id} userId={id} />
      ))}
    </Container>
  )
}

const Container = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  space: { inner: [4] },
  gap: '8px',
  height: 'calc(100vh - 200px)',
})

const InviteForm = styled('div', {
  width: '100%',
  height: '100%',
  center: true,
  label: true,
  color: 'rgba(255, 255, 255, 0.7)',
  ellipsis: true,
})

const Error = styled('div', {
  width: '100%',
  height: '100%',
  center: true,
  label: true,
  color: 'rgba(255, 255, 255, 0.7)',
})
