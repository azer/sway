import { styled } from 'themes'
import React from 'react'
import selectors from 'selectors'
import { useSelector, useDispatch } from 'state'
import { UserHeader } from 'components/UserHeader'
import { Avatar, AvatarRoot } from 'components/Avatar'
import { Emoji } from 'components/Emoji'
import { getLocalTime, relativeDate } from 'lib/datetime'
import { findModeByStatus } from 'state/presence'
import { StatusIcon } from 'features/Dock/StatusIcon'
import Icon from 'components/Icon'

interface Props {}

export default function (props: Props) {
  // const dispatch = useDispatch()
  const [user, updates, status, statusLabel, isOnline, room] = useSelector(
    (state) => {
      const userId = selectors.sidebar.getFocusedUserId(state)
      if (!userId) return [undefined, []]

      const status = selectors.statuses.getByUserId(state, userId)

      return [
        selectors.users.getById(state, userId),
        status ? [status] : [],
        status,
        selectors.presence.getPresenceLabelByUserId(state, userId),
        selectors.presence.isUserOnline(state, userId),
        selectors.rooms.getRoomById(state, status.room_id),
      ]
    }
  )

  return (
    <Container>
      <CardGrid>
        <Avatar
          src={user?.photoUrl}
          alt={user?.name}
          fallback={user?.name || 'User'}
          fontSize="$large"
        />
        <Card>
          <Name>{user?.name}</Name>
          <Email href={`mailto:${user?.email}`}>{user?.email}</Email>
        </Card>
      </CardGrid>
      <Table>
        <Prop>Status</Prop>
        <Value>
          {statusLabel}
          {status ? (
            <StatusIcon status={status} isOnline={isOnline} noEmoji />
          ) : undefined}
        </Value>
        {status?.timezone ? (
          <>
            <Prop>Local time</Prop>
            <Value>{getLocalTime(status?.timezone)}</Value>
          </>
        ) : null}
        <Prop>Room</Prop>
        <Value>{room?.name}</Value>
      </Table>

      <Buttons>
        <Button>
          <Icon name="users" />
          1:1 Room
        </Button>
        <Button>
          <Emoji id="wave" />
          Tap
        </Button>
        <Button>
          <Icon name="bell" />
          Notify when available
        </Button>
      </Buttons>

      {updates.length > 0 ? <Title>Updates</Title> : null}
      {updates
        .filter((u) => u?.message)
        .map((u) => (
          <Update>
            {status?.emoji ? <Emoji id={u.emoji} /> : null}
            <Message>
              {u?.message}
              <Time>{u ? relativeDate(u?.inserted_at) : ''}</Time>
            </Message>
          </Update>
        ))}
    </Container>
  )
}

const Container = styled('div', {
  padding: '32px',
})

const CardGrid = styled('div', {
  display: 'grid',
  gridTemplateColumns: '80px auto',
  height: '80px',
  [`& ${AvatarRoot}`]: {
    aspectRatio: '1',
    width: '80px',
    height: '80px',
    round: true,
  },
})

const Card = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  overflow: 'hidden',
  ellipsis: true,
  height: '100%',
  flexDirection: 'column',
  marginLeft: '8px',
})

const Name = styled('div', {
  fontSize: '$medium',
  color: '$white',
  label: true,
  ellipsis: true,
})

const Email = styled('a', {
  label: true,
  ellipsis: true,
  fontSize: '$base',
  color: 'rgba(225, 230, 255, 0.4)',
  textDecoration: 'none',
})

const Table = styled('div', {
  display: 'grid',
  gridTemplateColumns: 'min-content 1fr',
  gridRowGap: '12px',
  gridColumnGap: '16px',
  width: '100%',
  margin: '32px 0',
  fontSize: '13px',
})

export const Prop = styled('div', {
  fontWeight: '$medium',
  color: '$gray8',
  textAlign: 'left',
  whiteSpace: 'nowrap',
  label: true,
})

export const Value = styled('div', {
  fontWeight: '$medium',
  color: '$white',
  textAlign: 'left',
  ellipsis: true,
  label: true,
  display: 'flex',
  gap: '8px',
})

const Title = styled('h1', {
  fontSize: '13px',
  fontWeight: '$medium',
  color: '$gray8',
  margin: '24px 0 12px',
  vcenter: true,
  label: true,
})

const Update = styled('div', {
  display: 'flex',
  fontSize: '$small',
  gap: '6px',
  [`& em-emoji`]: {
    fontSize: '18px',
  },
})

const Time = styled('div', {
  marginTop: '4px',
  color: 'rgba(235,  240, 255, 0.5)',
  label: true,
  '&:first-letter': {
    textTransform: 'uppercase',
  },
})

const Message = styled('div', {
  display: 'flex',
  flexDirection: 'column',
})

const Buttons = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
})

const Button = styled('div', {
  round: 'medium',
  color: 'rgba(225, 245, 255, 0.7)',
  height: '38px',
  position: 'relative',
  vcenter: true,
  label: true,
  [`& svg`]: {
    width: '12px',
    height: '12px',
    marginRight: '8px',
    opacity: '0.55',
  },
  '& em-emoji': {
    marginRight: '8px',
  },
  '&::before': {
    content: ' ',
    width: 'calc(100% + 24px)',
    height: '100%',
    position: 'absolute',
    left: '-12px',
    round: 'medium',
    background: 'rgba(225, 235, 255, 0.04)',
  },
  '&:hover': {
    color: '$white',
    '&::before': {
      background: 'rgba(225, 235, 255, 0.08)',
    },
    '& svg': {
      color: '$candy',
      opacity: '1',
    },
  },
})
