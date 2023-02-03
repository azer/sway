import { styled } from 'themes'
import React, { useEffect, useRef } from 'react'
import selectors from 'selectors'
import { useSelector } from 'state'
import { Participant } from './RoomParticipant'
import { logger } from 'lib/log'
import { useMediaTrack, useScreenShare } from '@daily-co/daily-react-hooks'
import { PresenceMode } from 'state/entities'

interface Props {
  roomId: string
}

const log = logger('rooms/participant-grid')

export function ParticipantGrid(props: Props) {
  const { isSharingScreen } = useScreenShare()

  const [localUserId, activeUsers, inactiveUsers, divide] = useSelector(
    (state) => {
      const users = selectors.rooms.getUsersInRoom(state, props.roomId)

      const activeUsers = users.filter(
        (uid) =>
          selectors.presence.getStatusByUserId(state, uid).is_active ||
          selectors.presence.getStatusByUserId(state, uid).status ===
            PresenceMode.Social
      )

      const inactiveUsers = users.filter(
        (uid) =>
          !selectors.presence.getStatusByUserId(state, uid).is_active &&
          selectors.presence.getStatusByUserId(state, uid).status !==
            PresenceMode.Social
      )

      return [
        selectors.users.getSelf(state)?.id,
        activeUsers,
        inactiveUsers,
        false,
      ]
    }
  )

  let grid = gridRuleForActiveUsers(activeUsers.length)
  const alone = inactiveUsers.length + activeUsers.length === 1

  if (!window.navigator.onLine) {
    //return <Error>You're offline.</Error>
  }

  if (alone) {
    return (
      <InviteForm>{"It's just you right now. Invite some others!"}</InviteForm>
    )
  }

  //const shouldBeDivided = usersInRoom.length > 1 && usersInRoom.some(u => )

  if (!divide) {
    return (
      <Container>
        {activeUsers.filter(filterSelf).map((id) => (
          <Participant key={id} userId={id} />
        ))}

        {inactiveUsers.filter(filterSelf).map((id) => (
          <Participant key={id} userId={id} />
        ))}
      </Container>
    )
  }

  // {screens.length > 0 ? <Screens></Screens> : null}

  return (
    <Container divide={divide}>
      <ActiveGrid css={grid}>
        {activeUsers.map((id) => (
          <Participant key={id} userId={id} />
        ))}
      </ActiveGrid>
      <InactiveGrid>
        {inactiveUsers.map((id) => (
          <Participant key={id} userId={id} />
        ))}
      </InactiveGrid>
    </Container>
  )

  function filterSelf(userId: string) {
    return isSharingScreen || userId !== localUserId
  }
}

const Container = styled('div', {
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  space: { inner: [4] },
  gap: '8px',
  height: 'calc(100vh - 200px)',
  variants: {
    divide: {
      true: {
        display: 'grid',
        gridTemplateRows: 'auto',
        gridTemplateColumns: '1fr 150px',
        gridColumnGap: '16px',
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

const Error = styled('div', {
  width: '100%',
  height: '100%',
  center: true,
  label: true,
  color: 'rgba(255, 255, 255, 0.7)',
})

const ActiveGrid = styled('div', {
  height: '100%',
  display: 'grid',
  gridTemplateColumns: '1fr',
  justifyContent: 'center',
  alignItems: 'center',
  overflow: 'hidden',
})

const InactiveGrid = styled('div', {
  height: '100%',
  display: 'flex',
  justifyContent: 'start',
  alignItems: 'start',
  flexWrap: 'wrap',
})

function gridRuleForActiveUsers(n: number): string {
  if (n === 1) {
    return '1fr'
  }

  if (n < 4) {
    return 'repeat(3, 1fr);'
  }

  if (n === 4) {
    return '1fr 1fr'
  }

  if (n < 7) {
    return '1fr 1fr 1fr'
  }

  if (n < 9) {
    return '1fr 1fr 1fr 1fr'
  }

  return 'repeat(${n}, 1fr);'
}

function Screens() {
  const { screens } = useScreenShare()

  return (
    <ScreensContainer>
      {screens.map((s) => (
        <ScreenVideo id={s.session_id} />
      ))}
    </ScreensContainer>
  )
}

function ScreenVideo(props: { id: string }) {
  const videoTrack = useMediaTrack(props.id, 'screenVideo')
  const videoElement = useRef(null)

  useEffect(() => {
    const video = videoElement.current
    if (!video || !videoTrack?.persistentTrack) return
    /*  The track is ready to be played. We can show video of the participant in the UI. */
    // @ts-ignore
    video.srcObject = new MediaStream([videoTrack?.persistentTrack])
  }, [videoTrack?.persistentTrack])

  return <video autoPlay muted playsInline ref={videoElement} />
}

const ScreensContainer = styled('div', {
  width: '100%',
  height: '100%',
  '& video': {
    width: '100%',
  },
})
