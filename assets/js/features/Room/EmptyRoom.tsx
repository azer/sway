import { styled } from 'themes'
import React from 'react'
import selectors from 'selectors'
import { useSelector } from 'state'
import { Kbd } from 'components/Kbd'
import { firstName } from 'lib/string'

interface Props {
  id: string
}

export function EmptyRoom(props: Props) {
  const [user, room, isActive] = useSelector((state) => [
    selectors.users.getSelf(state),
    selectors.rooms.getRoomById(state, props.id),
    selectors.presence.isLocalUserActive(state),
  ])

  return (
    <Root>
      <Container>
        <Emoji>{isActive ? '😴' : '🎧'}</Emoji>
        <Title>
          <label>{firstName(user?.name || '')}</label>, welcome to{' '}
          <label>{room.name}</label> room.
        </Title>
        {isActive ? <EmptyRoomTips /> : <ActivateTip />}
      </Container>
    </Root>
  )
}

function EmptyRoomTips() {
  return (
    <>
      This room is empty at the moment. You can;
      <ul>
        <li>Join another room</li>
        <li>Wave someone to start talking</li>
        <li>Set your status</li>
        <li>Invite a new member</li>
      </ul>
      And to start talking, just press the <Kbd keys={['space']} /> button.
    </>
  )
}

function ActivateTip() {
  return (
    <>
      To start talking, just press the <Kbd keys={['space']} /> button.
    </>
  )
}

const Root = styled('div', {
  position: 'relative',
  width: '100%',
  height: '100%',
})

const Container = styled('div', {
  position: 'absolute',
  bottom: '20px',
  margin: 'auto',
  color: 'rgba(215, 220, 225, 0.7)',
  borderLeft: '4px solid rgba(235, 245, 255, 0.1)',
  padding: '4px 4px 8px 16px',
  ul: {
    listStyle: 'none',
    padding: '0',
    margin: '8px 0',
  },
  'ul li': {
    lineHeight: '1.7',
  },
  'ul li:before': {
    content: '—',
    margin: '0 8px 0 20px',
    color: '$gray3',
  },
})

const Emoji = styled('span', {
  fontSize: '48px',
  color: '$white',
})

const Title = styled('h1', {
  fontSize: '$medium',
  fontWeight: '$base',
  color: '$white',
  lineHeight: '1.2',
  padding: '0',
  '& label': {
    fontWeight: '$semibold',
    textTransform: 'capitalize',
  },
})
