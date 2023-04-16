import { styled } from 'themes'
import React, { useEffect } from 'react'
import selectors from 'selectors'
import {
  StatusHeader,
  StatusUpdate,
  StyledStatus,
  StyledStatusUpdate,
} from 'components/StatusUpdate'
import { Updates } from './Update'
import { Title } from 'components/SidebarButton'
import { useSelector, useDispatch } from 'state'
import { AvatarRoot } from 'components/Avatar'
import { addBatch } from 'state/entities'
import { GET } from 'lib/api'
import { setRoomStatusUpdates } from 'features/Presence/slice'
import { logger } from 'lib/log'

interface Props {
  roomId: string
  standalone?: boolean
}

const log = logger('sidebar/status')

export function StatusSidebar(props: Props) {
  const dispatch = useDispatch()
  const [room, updates] = useSelector((state) => [
    selectors.rooms.getRoomById(state, props.roomId),
    selectors.presence
      .getStatusUpdatesByRoomId(state, props.roomId)
      .map((id: string) => {
        return {
          id,
          status: selectors.statuses.getById(state, id),
          user: selectors.users.getById(
            state,
            selectors.statuses.getById(state, id)?.user_id || ''
          ),
        }
      }),
  ])

  useEffect(() => {
    GET(`/api/rooms/${props.roomId}/updates`)
      .then((response) => {
        if (!response.list) return log.error('Unexpected response', response)

        dispatch(addBatch(response.list.concat(response.links) as Update[]))

        dispatch(
          setRoomStatusUpdates({
            roomId: props.roomId,
            updates: response.list.map((d) => d.id),
          })
        )
      })
      .catch((err) => {
        log.error('Can not fetch updates', err)
      })
  }, [props.roomId])

  const content = (
    <StyledStatusSidebar>
      {updates.map((update) => (
        <StatusUpdate
          id={update.id}
          username={update.user?.name || ''}
          status={update.status?.message || ''}
          emoji={update.status?.emoji || ''}
          profilePhotoUrl={update.user?.profile_photo_url || ''}
          insertedAt={update.status?.inserted_at}
        />
      ))}
      {updates.length === 0 ? <Empty>No updates yet</Empty> : null}
    </StyledStatusSidebar>
  )

  if (!props.standalone)
    return (
      <>
        <Title>Updates</Title>
        {content}
      </>
    )

  return (
    <Container>
      <Title>Updates</Title>
      <Scroll>{content}</Scroll>
    </Container>
  )
}

const Container = styled('div', {
  padding: '0 12px',
})

const Scroll = styled('div', {
  height: 'calc(100vh - 130px)',
  scrollbar: { y: true },
  h1: {
    marginTop: '0',
  },
})

const StyledStatusSidebar = styled(Updates, {
  gap: '18px',
  [`${StyledStatusUpdate}`]: {
    display: 'grid',
    gridTemplateColumns: '26px auto',
    '& em-emoji': {
      marginLeft: '2px',
    },
    [`${StatusHeader}`]: {
      fontSize: '$small',
      display: 'flex',
      alignItems: 'start',
      color: '$gray5',
      '& label': {
        margin: '0',
      },
      '& span': {
        fontSize: '$small',
        color: '$gray4',
        marginTop: '-1px',
        marginLeft: '0',
      },
      '& > span::before': {
        content: '·',
        margin: '0 4px',
      },
    },
    [`${StyledStatus}`]: {
      color: '$chatMessageBodyFg',
      fontSize: '13px',
    },
    [`${AvatarRoot}`]: {
      height: '24px',
    },
  },
})

export const Empty = styled('label', {
  width: '100%',
  height: '50px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '$gray5',
  fontSize: '$small',
})
