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
import { ActiveParticipantRoot } from 'features/Call/ActiveParticipant'
import { AvatarRoot } from 'components/Avatar'

interface Props {
  id: string
}

const log = logger('room')

export function RoomPage(props: Props) {
  const [localUserId, isLocalActive, minimizedParticipants] = useSelector(
    (state) => {
      const users = selectors.rooms.getOtherUsersInRoom(state, props.id)
      const active = users.filter(
        selectors.presence.filterActiveUsers(state, true)
      )
      const inactive = active.length
        ? users.filter(selectors.presence.filterActiveUsers(state, false))
        : undefined

      return [
        selectors.session.getUserId(state),
        selectors.presence.isLocalUserActive(state),
        inactive,
      ]
    }
  )

  return (
    <Container electron={isElectron} isLocalActive={isLocalActive}>
      <ScreenshareProvider />
      {!isElectron ? (
        <Header>
          <RoomButton roomId={props.id} />
        </Header>
      ) : null}
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
      <ParticipantGrid roomId={props.id} />
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
  height: '100vh',
  //display: 'flex',
  //flexDirection: 'column',
  display: 'grid',
  gridTemplateRows: '48px 86px auto 72px',
  gap: '12px',
  backgroundImage: topBlurEffect,
  variants: {
    isLocalActive: {
      true: {
        gridTemplateRows: '48px 118px auto 72px',
      },
    },
    electron: {
      true: {
        gridTemplateRows: '86px auto 80px',
        background: 'none',
        paddingTop: '12px',
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
      height: '35%',
    },
  },
  [`& ${ParticipantLabelRoot}`]: {
    background: 'transparent',
    height: 'auto',
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

const Bottom = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  marginBottom: '12px',
})
