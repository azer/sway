import { styled } from 'themes'
import React, { useEffect, useRef } from 'react'
import selectors from 'selectors'
import { useSelector } from 'state'
import { Participant } from './RoomParticipant'
import logger from 'lib/log'
import { PresenceMode } from 'features/Dock/slice'
import { useMediaTrack, useScreenShare } from '@daily-co/daily-react-hooks'
import { CommandType } from 'features/CommandPalette'
import { useCommandRegistry } from 'features/CommandRegistry'

interface Props {
  roomId: string
}

const log = logger('rooms/participant-grid')

export function ParticipantGrid(props: Props) {
  // const dispatch = useDispatch()
  // const [] = useSelector((state) => [])

  const [activeUsers, inactiveUsers, divide] = useSelector((state) => {
    const users = selectors.rooms
      .getUsersInRoom(state, props.roomId)
      .filter((id) => selectors.users.getSelf(state)?.id !== id)

    const activeUsers = users.filter(
      (uid) =>
        selectors.dock.getPresenceStatusByUserId(state, uid).mode ===
        PresenceMode.Active
    )
    const inactiveUsers = users.filter(
      (uid) =>
        selectors.dock.getPresenceStatusByUserId(state, uid).mode !==
        PresenceMode.Active
    )

    return [
      activeUsers,
      inactiveUsers,
      activeUsers.length > 0 && inactiveUsers.length > 0,
      window.innerWidth / window.innerHeight <= 1.33,
    ]
  })

  let grid = gridRuleForActiveUsers(activeUsers.length)
  const alone = inactiveUsers.length === 0 && activeUsers.length === 0

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
        {activeUsers.map((id) => (
          <Participant key={id} userId={id} />
        ))}

        {inactiveUsers.map((id) => (
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
