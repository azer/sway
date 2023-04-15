import { styled } from 'themes'
import React, { useEffect } from 'react'
import selectors from 'selectors'
import { useSelector, useDispatch } from 'state'
import { Avatar, AvatarRoot } from 'components/Avatar'
import { Emoji } from 'components/Emoji'
import { getLocalTime, relativeDate } from 'lib/datetime'
import { PresenceStatus } from 'state/presence'
import { StatusIcon } from 'features/Dock/StatusIcon'
import Icon from 'components/Icon'
import { logger } from 'lib/log'
import { GET } from 'lib/api'
import { setStatusUpdates } from 'features/Presence/slice'
import { addBatch, Room, Row, Status } from 'state/entities'
import { usePresence } from 'features/Presence/use-presence'
import { setStatusHook } from 'features/Tap/slice'
import { useNavigate } from 'react-router-dom'
import { useRooms } from 'features/Room/use-rooms'
import { setSidebarOpen } from './slice'
import {
  SidebarButton,
  SidebarButtonset,
  Title,
} from 'components/SidebarButton'
import { StatusUpdate, Updates } from './Update'

interface Props {}

const log = logger('sidebar/user-sidebar')

export function UserSidebar(props: Props) {
  const dispatch = useDispatch()
  const presence = usePresence()
  const rooms = useRooms()
  const navigate = useNavigate()

  const [
    user,
    updates,
    status,
    statusLabel,
    isOnline,
    room,
    existingHook,
    localUserId,
    workspaceId,
    workspaceSlug,
    privateRoomId,
  ] = useSelector((state) => {
    const userId = selectors.sidebar.getFocusedUserId(state)
    if (!userId) return [undefined, []]

    const status = selectors.statuses.getByUserId(state, userId)

    return [
      selectors.users.getById(state, userId),
      selectors.presence.getUserUpdatesByUserId(state, userId),
      status,
      selectors.presence.getPresenceLabelByUserId(state, userId),
      selectors.presence.isUserOnline(state, userId),
      selectors.rooms.getRoomById(state, status.room_id),
      selectors.taps.getStatusHookByUserId(state, userId),
      selectors.session.getUserId(state),
      selectors.workspaces.getSelfWorkspace(state)?.id,
      selectors.workspaces.getSelfWorkspace(state)?.slug,
      selectors.rooms.get1v1RoomIdByUserId(state, userId),
    ]
  })

  useEffect(() => {
    if (!user) return

    GET(`/api/users/${user.id}/updates`)
      .then((response) => {
        if (!response.list) return log.error('Unexpected response', response)

        dispatch(addBatch(response.list as Row<Status>[]))

        dispatch(
          setStatusUpdates({
            userId: user.id,
            updates: response.list.map((d) => d.id),
          })
        )
      })
      .catch((err) => {
        log.error('Can not fetch updates', err)
      })
  }, [user?.id])

  return (
    <Container>
      <CardGrid>
        <Avatar
          src={user?.profile_photo_url}
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

      <SidebarButtonset>
        <SidebarButton onClick={() => createPrivateRoom()}>
          <Icon name="users" />
          1:1 Room
        </SidebarButton>
        <SidebarButton onClick={() => user?.id && presence.tap(user.id)}>
          <Emoji id="wave" />
          Wave
        </SidebarButton>
        <SidebarButton
          onClick={() => user && createStatusHook(user.id, status?.status)}
        >
          <Icon name={existingHook ? 'checkmark' : 'bell'} />
          Notify when available
        </SidebarButton>
      </SidebarButtonset>
      {updates.length > 0 ? <Title>Updates</Title> : null}
      {updates.length > 0 ? (
        <Updates>
          {updates.map((id) => (
            <StatusUpdate id={id} />
          ))}
        </Updates>
      ) : null}
    </Container>
  )

  function createStatusHook(userId: string, status: PresenceStatus) {
    dispatch(
      setStatusHook({
        userId,
        whenPresentAs:
          status !== PresenceStatus?.Online
            ? PresenceStatus?.Online
            : undefined,
        whenActive: status === PresenceStatus?.Online,
      })
    )
  }

  function createPrivateRoom() {
    if (!workspaceId || !user || !localUserId) return

    if (privateRoomId) {
      rooms.enterById(privateRoomId)
      dispatch(setSidebarOpen(false))
      return
    }

    rooms
      .createPrivateRoom(workspaceId, [user.id, localUserId])
      .then((resp) => {
        const created = resp.result as Row<Room>
        navigate(`/${workspaceSlug}/room/${created.id}/${created.data.slug}`)
      })
  }
}

const Container = styled('div', {
  padding: '32px',
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100vh - 48px)',
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
  margin: '24px 0',
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
