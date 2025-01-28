import { useCommandPalette } from 'features/CommandPalette'
import { useCommandRegistry } from 'features/CommandRegistry'
import { Onboarding } from 'features/Onboarding'
import { RoomPage } from 'features/Room'
import { Shell } from 'features/Shell'
import { logger } from 'lib/log'
import React, { useEffect } from 'react'
import {
  BrowserRouter,
  Route,
  Routes,
  useNavigate,
  useParams,
} from 'react-router-dom'
import selectors from 'selectors'
import { useSelector } from 'state'

const log = logger('routing')

export default function Routing(): JSX.Element {
  const reg = useCommandRegistry()
  const cmd = useCommandPalette()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DefaultWorkspace />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/:workspace" element={<DefaultRoom />} />
        <Route
          path="/:workspace/1v1/:user_id"
          element={<InitialPrivateRoomRoute />}
        />
        <Route path="/:workspace/room/:room_slug" element={<RoomRoute />} />
        <Route
          path="/:workspace/room/:room_id/:room_slug"
          element={<PrivateRoomRoute />}
        />
      </Routes>
    </BrowserRouter>
  )
}

function DefaultWorkspace(): JSX.Element {
  const navigate = useNavigate()
  const [workspace, room] = useSelector((state) => [
    selectors.workspaces.getSelfWorkspace(state),
    selectors.rooms.getDefaultRoom(state),
  ])

  log.info('Default workspace:', workspace, room)

  useEffect(() => {
    if (!workspace || !room) return
    log.info('Redirecting to default workspace')
    navigate(`/${workspace.slug}/room/${room?.slug}`)
  }, [workspace?.slug, room?.slug])

  return <></>
}

function DefaultRoom(): JSX.Element {
  const navigate = useNavigate()
  const params = useParams()

  const [room, isOnboardingDone] = useSelector((state) => [
    selectors.rooms.getDefaultRoom(state),
    selectors.onboarding.isDone(state),
  ])

  useEffect(() => {
    if (isOnboardingDone === false) {
      return navigate(`/onboarding`)
    }

    if (!room) return
    log.info('Redirecting to default room')
    navigate(`/${params.workspace}/room/${room?.slug}`)
  }, [room?.slug, isOnboardingDone])

  return <></>
}

function PrivateRoomRoute() {
  // const dispatch = useDispatch()
  // const [] = useSelector((state) => [])

  const params = useParams()

  return (
    <Shell>
      {params.room_id ? <RoomPage id={params.room_id} /> : 'Bad route'}
    </Shell>
  )
}

function RoomRoute() {
  const params = useParams()
  const navigate = useNavigate()

  const [roomId, isOnboardingDone] = useSelector((state) => {
    const room = params.room_slug
      ? selectors.rooms.getRoomBySlug(state, params.room_slug)
      : undefined

    return [room?.id, selectors.onboarding.isDone(state)]
  })

  if (isOnboardingDone === false) {
    return navigate(`/onboarding`)
  }

  return <Shell>{roomId ? <RoomPage id={roomId} /> : null}</Shell>
}

function InitialPrivateRoomRoute() {
  // const dispatch = useDispatch()
  // const [] = useSelector((state) => [])

  const { workspace, user_id } = useParams()

  return (
    <Shell>
      please wait {workspace} {user_id}
    </Shell>
  )
}
