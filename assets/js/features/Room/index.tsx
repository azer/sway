import React, { useEffect } from 'react'
import { styled } from 'themes'
import { logger } from 'lib/log'
import { ParticipantGrid } from './ParticipantGrid'

import { Dock } from 'features/Dock'
import { ScreenshareProvider } from 'features/Screenshare/Provider'
import { RoomButton } from './RoomButton'
import { isElectron } from 'lib/electron'
import { CallDock } from 'features/CallDock'

import { useSelector, useDispatch } from 'state'
import selectors from 'selectors'
import { Participant, RoomParticipantRoot } from './RoomParticipant'
import { ParticipantLabelRoot } from 'components/ParticipantLabel'
import {
  ActiveParticipant,
  ActiveParticipantRoot,
} from 'features/Call/ActiveParticipant'
import { AvatarRoot } from 'components/Avatar'
import { CallTile } from 'features/Call/Tile'
import { usePresence } from 'features/Presence/use-presence'

interface Props {
  id: string
}

const log = logger('room')

export function RoomPage(props: Props) {
  const presence = usePresence()

  const [
    localUserId,
    isLocalActive,
    focusedUserId,
    focusedParticipantId,
    mainParticipants,
    minimizedParticipants,
  ] = useSelector((state) => {
    const users = selectors.rooms.getOtherUsersInRoom(state, props.id)

    const active = users.filter(
      selectors.presence.filterActiveUsers(state, true)
    )
    const inactive = users.filter(
      selectors.presence.filterActiveUsers(state, false)
    )

    const screensharing = selectors.rooms
      .getUsersInRoom(state, props.id)
      .filter(selectors.call.filterScreensharingUsers(state))

    const minimizedParticipants =
      screensharing.length > 0
        ? [...active, ...inactive]
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
    ]
  })

  return (
    <Container
      electron={isElectron}
      isLocalActive={isLocalActive}
      activeOnElectron={isElectron && isLocalActive}
    >
      <ScreenshareProvider />
      <Top isLocalActive={isLocalActive}>
        {localUserId && isLocalActive ? (
          <Participant userId={localUserId} />
        ) : (
          <Dock roomId={props.id} />
        )}
        {minimizedParticipants?.map((uid) => (
          <Participant userId={uid} />
        ))}
      </Top>
      <Middle>
        {focusedUserId && focusedParticipantId ? (
          <ActiveParticipant
            userId={focusedUserId}
            participantId={focusedParticipantId}
            tap={presence.tap}
            showScreen
          />
        ) : !focusedUserId && mainParticipants.length ? (
          <CallTile ids={mainParticipants} />
        ) : null}
      </Middle>
      <Bottom>
        <CallDock />
      </Bottom>
    </Container>
  )
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
        height: 'calc(100vh - 48px)',
        gridTemplateRows: '86px auto 72px',
        background: 'none',
        paddingTop: '12px',
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
  overflowX: 'scroll',
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
