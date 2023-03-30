import { useCommandPalette } from 'features/CommandPalette'
import { useCommandRegistry } from 'features/CommandRegistry'
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
        <Route path="/:workspace" element={<DefaultRoom />} />
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

  const [room] = useSelector((state) => [selectors.rooms.getDefaultRoom(state)])

  useEffect(() => {
    if (!room) return
    log.info('Redirecting to default room')
    navigate(`/${params.workspace}/room/${room?.slug}`)
  }, [room?.slug])

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

  const [roomId] = useSelector((state) => {
    const room = params.room_slug
      ? selectors.rooms.getRoomBySlug(state, params.room_slug)
      : undefined
    log.info('room route;;', params.room_slug, room)

    return [room?.id]
  })

  return <Shell>{roomId ? <RoomPage id={roomId} /> : null}</Shell>
}
