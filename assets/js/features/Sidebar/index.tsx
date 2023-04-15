import { styled } from 'themes'
import React from 'react'
import selectors from 'selectors'
import { useSelector } from 'state'
import { SidebarContent } from './focus'
import { UserSidebar } from './UserSidebar'
import { Chat } from 'features/Chat'
import { RoomSidebar } from './RoomSidebar'

interface Props {}

export function Sidebar(props: Props) {
  // const dispatch = useDispatch()
  // const [] = useSelector((state) => [])
  const [isOpen, content, focusedRoomId, roomIdOnSidebar] = useSelector(
    (state) => [
      selectors.sidebar.isOpen(state),
      selectors.sidebar.getContent(state),
      selectors.rooms.getFocusedRoomId(state),
      selectors.sidebar.getRoomIdOnSidebar(state),
    ]
  )

  return (
    <Container isOpen={isOpen}>
      {isOpen && content === SidebarContent.User ? <UserSidebar /> : null}
      {isOpen && focusedRoomId && content === SidebarContent.Chat ? (
        <Chat roomId={focusedRoomId} />
      ) : null}
      {isOpen && roomIdOnSidebar && content === SidebarContent.Room ? (
        <RoomSidebar roomId={roomIdOnSidebar} />
      ) : null}
    </Container>
  )
}

const Container = styled('aside', {
  width: '300px',
  borderLeft: '1px solid $shellBorderColor',
  color: '$white',
  transition: 'width 0.1s ease-in-out',
  display: 'block',
  variants: {
    isOpen: {
      true: {
        //        width: '300px'
      },
      false: {
        width: '0',
        overflow: 'hidden',
        marginRight: '-1px',
      },
    },
  },
})
