import React, { useEffect } from 'react'
import { styled } from 'themes'
import { logger } from 'lib/log'
import { Dock } from 'features/Dock'
import { ScreenshareProvider } from 'features/Screenshare/Provider'
import { isElectron } from 'lib/electron'
import { CallDock } from 'features/CallDock'
import { useSelector, useDispatch } from 'state'
import selectors from 'selectors'
import { RoomParticipant, RoomParticipantRoot } from './RoomParticipant'
import { ParticipantLabelRoot } from 'components/ParticipantLabel'
import {
  ActiveParticipant,
  ActiveParticipantRoot,
} from 'features/Call/ActiveParticipant'
import { AvatarRoot } from 'components/Avatar'
import { CallTile } from 'features/Call/Tile'
import { usePresence } from 'features/Presence/use-presence'
import { moveUserToRoom, setFocusedRoomById } from './slice'
import { setWorkspaceFocusRegion } from 'features/Workspace/slice'
import { WorkspaceFocusRegion } from 'features/Workspace/focus'
import { EmptyRoom } from './EmptyRoom'

interface Props {
  id: string
}

const log = logger('room')

export function RoomPage(props: Props) {
  const dispatch = useDispatch()
  const presence = usePresence()

  const [
    localUserId,
    isLocalActive,
    focusedUserId,
    focusedParticipantId,
    mainParticipants,
    minimizedParticipants,
    focusedRoomId,
  ] = useSelector((state) => {
    const users = selectors.rooms.getOtherUsersInRoom(state, props.id)

    const online = users.filter((userId: string) =>
      selectors.presence.isUserOnline(state, userId)
    )

    const active = online.filter(
      selectors.presence.filterActiveUsers(state, true)
    )
    const inactive = online.filter(
      selectors.presence.filterActiveUsers(state, false)
    )

    const screensharing = selectors.rooms
      .getUsersInRoom(state, props.id)
      .filter(selectors.call.filterScreensharingUsers(state))

    const minimizedParticipants =
      screensharing.length > 0
        ? [...active, ...inactive].filter(userId => !selectors.call.isUserScreensharing(state, userId))
        : active.length > 0
          ? inactive
          : undefined

    const mainParticipants =
      screensharing.length > 0
        ? screensharing
        : active.length > 0
          ? active
          : inactive

    const focusedUserId = screensharing ? screensharing[0] : undefined
    const focusedParticipantId = focusedUserId
      ? selectors.call.getParticipantStatusByUserId(state, focusedUserId)
        ?.dailyUserId
      : undefined

    return [
      selectors.session.getUserId(state),
      selectors.presence.isLocalUserActive(state),
      focusedUserId,
      focusedParticipantId,
      mainParticipants,
      minimizedParticipants,
      selectors.rooms.getFocusedRoom(state)?.id,
    ]
  })

  useEffect(() => {
    if (props.id !== focusedRoomId) {
      log.info('User navigated to another room', props.id, focusedRoomId)
      dispatch(moveUserToRoom({ roomId: props.id, userId: localUserId || '' }))
      dispatch(setFocusedRoomById(props.id))
    }
  }, [props.id, focusedRoomId])

  return (
    <Container
      electron={isElectron}
      isLocalActive={isLocalActive}
      activeOnElectron={isElectron && isLocalActive}
    >
      <ScreenshareProvider />
      <Top isLocalActive={isLocalActive}>
        {localUserId && isLocalActive ? (
          <RoomParticipant userId={localUserId} tap={tap} />
        ) : (
          <Dock roomId={props.id} tap={tap} />
        )}
        {minimizedParticipants?.map((uid) => (
          <RoomParticipant userId={uid} tap={tap} />
        ))}
      </Top>
      <Middle
        onClick={() =>
          dispatch(setWorkspaceFocusRegion(WorkspaceFocusRegion.Room))
        }
      >
        {focusedUserId && focusedParticipantId ? (
          <ActiveParticipant
            userId={focusedUserId}
            participantId={focusedParticipantId}
            tap={presence.tap}
            showScreen
          />
        ) : !focusedUserId && mainParticipants.length ? (
          <CallTile ids={mainParticipants} tap={tap} />
        ) : (
          <EmptyRoom id={props.id} />
        )}
      </Middle>
      <Bottom>
        <CallDock />
      </Bottom>
    </Container>
  )

  function tap(userId: string) {
    presence.tap(userId)
  }
}

export const topBlurEffect =
  'radial-gradient(1000px at 200px -700px, $shellBlur1, transparent)'

const Container = styled('main', {
  width: '100%',
  //height: '100vh',
  height: 'calc(100vh - 48px)',
  display: 'grid',
  gridTemplateRows: '86px auto 72px',
  gap: '12px',
  //backgroundImage: topBlurEffect,
  variants: {
    isLocalActive: {
      true: {
        gridTemplateRows: '118px auto 72px',
      },
    },
    electron: {
      true: {
        background: 'none',
      },
    },
    activeOnElectron: {
      true: {
        gridTemplateRows: '118px auto 72px',
      },
    },
  },
})

const Header = styled('header', {
  width: '100%',
  height: '48px',
  display: 'flex',
  space: { inner: [0, 5] },
  borderBottom: '1px solid $shellBorderColor',
  vcenter: true,
})

const Top = styled('div', {
  center: true,
  position: 'relative',
  flexDirection: 'row',
  overflow: 'hidden', // FIXME: enable horizontal scroll
  gap: '8px',
  height: '90px',
  [`& ${RoomParticipantRoot}`]: {
    width: 'auto',
    height: 'calc(100% - 4px)',
    round: 'large',
    [`& ${AvatarRoot}`]: {
      height: '40%',
    },
  },
  [`& ${ParticipantLabelRoot}`]: {
    background: 'transparent',
    height: '22px',
  },
  [`& ${ActiveParticipantRoot}`]: {
    width: 'auto',
    height: '100%',
    round: 'large',
  },
  variants: {
    isLocalActive: {
      true: {
        height: '118px',
        [`& ${RoomParticipantRoot}`]: {
          height: '100%',
        },
      },
    },
  },
})

const Middle = styled('section', {
  display: 'flex',
  overflow: 'hidden',
  padding: '0 20px',
})

const Bottom = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '12px',
})
