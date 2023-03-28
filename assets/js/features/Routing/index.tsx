import { useCommandPalette } from 'features/CommandPalette'
import { useCommandRegistry } from 'features/CommandRegistry'
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
import { MainRoute } from './Main'
import { PrivateRoomRoute } from './PrivateRoom'

const log = logger('routing')

export default function Routing(): JSX.Element {
  const reg = useCommandRegistry()
  const cmd = useCommandPalette()

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DefaultWorkspace />} />
        <Route path="/:workspace" element={<DefaultRoom />} />
        <Route path="/:workspace/room/:room" element={<MainRoute />} />
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
