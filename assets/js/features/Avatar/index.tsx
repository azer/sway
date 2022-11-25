import { styled } from 'themes'
import React, { useEffect } from 'react'
import selectors from 'selectors'
import { useSelector, useDispatch, entities } from 'state'
import { useUserSocket } from 'features/UserSocket'
import { Users } from 'state/entities'
import AvatarView from 'components/Avatar'

interface Props {
  id: string
  small?: boolean
}

export default function AvatarFeature(props: Props) {
  const socket = useUserSocket()
  const [user] = useSelector((state) => [
    selectors.users.getById(state, props.id),
  ])

  useEffect(() => {
    if (!user) {
      socket.fetchEntity(Users, props.id)
    }
  }, [!user])

  return (
    <AvatarView
      name={user?.name}
      photoUrl={user?.photoUrl}
      small={props.small}
    ></AvatarView>
  )
}
