import { styled } from 'themes'
import React from 'react'
import selectors from 'selectors'
import { useSelector } from 'state'
import { Kbd } from 'components/Kbd'
import { firstName } from 'lib/string'
import { Avatar, AvatarRoot } from 'components/Avatar'
import { Emoji } from 'components/Emoji'

interface Props {
  id: string
  tap: (userId: string) => void
}

export function EmptyRoom(props: Props) {
  const [localUser, room, isActive, roomMembers] = useSelector((state) => [
    selectors.users.getSelf(state),
    selectors.rooms.getRoomById(state, props.id),
    selectors.status.isLocalUserActive(state),
    selectors.roomMembers
      .getMembersByRoomId(state, props.id)
      .map((userId) => selectors.users.getById(state, userId)),
  ])

  const otherUsers = roomMembers.filter((u) => localUser?.id !== u?.id)

  if (room.is_private) {
    return (
      <Root>
        <Container>
          <Avatars>
            {roomMembers.map((user) => (
              <Avatar
                src={user?.profile_photo_url}
                fallback={user?.name || 'User'}
              />
            ))}
          </Avatars>
          <Title>
            <label>{otherUsers.map((u) => u?.name)}</label>
            &nbsp; is not here yet.
          </Title>
          <div>Ready to start a conversation? Send a wave!</div>
          <Button onClick={wave}>
            <Emoji id="wave" size="1.2rem" /> Wave to{' '}
            {otherUsers.map((u) => firstName(u?.name || ''))}
          </Button>
        </Container>
      </Root>
    )
  }

  return (
    <Root>
      <Container>
        <RoomStatusEmoji>{isActive ? '😴' : '🎧'}</RoomStatusEmoji>
        <Title>
          <label>{firstName(localUser?.name || '')}</label>, welcome to{' '}
          <label>{room.name}</label> room.
        </Title>
        {isActive ? <EmptyRoomTips /> : <ActivateTip />}
      </Container>
    </Root>
  )

  function wave() {
    if (otherUsers[0]) {
      props.tap(otherUsers[0].id)
    }
  }
}

function EmptyRoomTips() {
  return (
    <>
      It{"'"}s just you in the room at the moment. You can;
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

const RoomStatusEmoji = styled('span', {
  fontSize: '32px',
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
    //textTransform: 'capitalize',
  },
})

const Avatars = styled('div', {
  display: 'flex',
  gap: '8px',
  height: '40px',
  [`${AvatarRoot}`]: {
    height: '100%',
    round: 'medium',
    fontSize: '$medium',
  },
})

const Button = styled('div', {
  display: 'inline-flex',
  border: '1px solid rgba(255, 255, 255, 0.06)',
  background: 'rgba(255, 255, 255, 0.05)',
  padding: '10px 16px 10px 36px',
  marginTop: '12px',
  round: 'small',
  color: 'rgba(255, 255, 255, 0.85)',
  cursor: 'pointer',
  position: 'relative',
  'em-emoji': {
    marginRight: '10px',
    position: 'absolute',
    left: '8px',
    top: '8px',
  },
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.07)',
    color: '$white',
  },
})
