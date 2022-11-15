import { styled } from '@stitches/react'
import { update } from 'features/Presence/slice'
import React, { useEffect } from 'react'
import selectors from 'selectors'
import useUserSocket, { context, initialState } from './use-user-socket'
import { useDispatch } from 'react-redux'
// import { useSelector, useDispatch } from 'app/state'

interface Props {
  children: React.ReactNode
}

export default function UserSocket(props: Props) {
  const dispatch = useDispatch()
  // const [] = useSelector((state) => [])

  const { socket, presence, channel } = initialState

  useEffect(() => {
    console.log('Setting up user socket')

    socket.connect()

    channel
      .join()
      .receive('ok', (resp) => {
        console.log('Joined successfully', resp)
      })
      .receive('error', (resp) => {
        console.log('Unable to join', resp)
      })

    presence.onSync(() => {
      const all = []

      presence.list((id, props) => {
        const last = props.metas[props.metas.length - 1]
        all.push({ id: String(last.user_id), lastSeenAt: last.online_at })
      })

      dispatch(update(all))
    })
  }, [])

  return (
    <context.Provider value={initialState}>{props.children}</context.Provider>
  )
}
