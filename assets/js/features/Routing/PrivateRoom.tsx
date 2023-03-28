import { RoomPage } from 'features/Room'
import { Shell } from 'features/Shell'
import React from 'react'
import { useParams } from 'react-router-dom'
import selectors from 'selectors'
// import selectors from 'selectors'
import { useSelector, useDispatch } from 'state'

interface Props {}

export function PrivateRoomRoute(props: Props) {
  // const dispatch = useDispatch()
  // const [] = useSelector((state) => [])

  const params = useParams()

  return (
    <Shell>
      {params.room_id ? <RoomPage id={params.room_id} /> : 'Bad route'}
    </Shell>
  )
}
