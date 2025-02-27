import { styled } from 'themes'
import { isElectron } from 'lib/electron'
import React from 'react'
import selectors from 'selectors'
import Icon from 'components/Icon'
import { useSelector, useDispatch } from 'state'
import { openChatSidebar, openStatusSidebar, setSidebarOpen } from './slice'
import { SidebarContent } from './focus'

interface Props {}

export function SidebarHeader(props: Props) {
  const dispatch = useDispatch()
  const [isOpen, hasContent, content, hasUnreadMessage] = useSelector(
    (state) => [
      selectors.sidebar.isOpen(state),
      selectors.sidebar.hasContent(state),
      selectors.sidebar.getContent(state),
      selectors.chat.hasUnreadMessageInFocusedRoom(state),
    ]
  )

  /*
     <StatusButton
          unread={false}
          onClick={toggleStatusUpdates}
          isOpen={isOpen && content === SidebarContent.StatusUpdates}
        >
          <Icon name="activity" />
          </StatusButton>
          */

  return (
    <Container>
      <Buttons>
        <ChatButton
          unread={hasUnreadMessage}
          onClick={toggleChat}
          isOpen={isOpen && content === SidebarContent.Chat}
        >
          <Icon name="chat" />
        </ChatButton>
        {hasContent ? (
          <ToggleButton onClick={toggle} isOpen={isOpen}>
            <Icon name="sidebar" />
          </ToggleButton>
        ) : null}
      </Buttons>
    </Container>
  )

  function toggle() {
    dispatch(setSidebarOpen(!isOpen))
  }

  function toggleChat() {
    if (content === SidebarContent.Chat && isOpen) {
      dispatch(setSidebarOpen(false))
    } else {
      dispatch(openChatSidebar())
    }
  }

  function toggleStatusUpdates() {
    dispatch(openStatusSidebar())
  }
}

const Container = styled('header', {
  display: 'flex',
  height: '48px',
  width: '300px',
  borderBottom: '1px solid $shellBorderColor',
  transition: 'width 0.1s ease-in-out',
})

const Title = styled('div', {
  fontSize: '14px',
  fontFamily: '$sans',
  color: '$white',
  height: '100%',
  flex: '1',
  vcenter: true,
  fontWeight: '$medium',
  marginLeft: '8px',
})

const Buttons = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'end',
  width: '100%',
  height: '100%',
  marginRight: '8px',
  gap: '6px',
})

const Button = styled('div', {
  '-webkit-app-region': 'no-drag',
  aspectRatio: '1',
  height: '24px',
  color: '$white',
  round: 'small',
  center: true,
  position: 'relative',
  '& svg': {
    aspectRatio: '1',
    height: '12px',
  },
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.1)',
  },
  variants: {
    isOpen: {
      true: {
        background: 'rgba(255, 255, 255, 0.1)',
      },
    },
  },
})

const ToggleButton = styled(Button, {
  '& svg': {
    transform: 'rotate(180deg)',
  },
  variants: {
    isOpen: {
      true: {
        background: 'transparent',
        '&::after': {
          content: ' ',
          position: 'absolute',
          width: '3px',
          height: '10px',
          background: '$white',
          right: '7px',
        },
      },
    },
  },
})

const ChatButton = styled(Button, {
  variants: {
    unread: {
      true: {
        '&::after': {
          content: ' ',
          position: 'absolute',
          width: '6px',
          height: '6px',
          right: '4px',
          top: '4px',
          round: true,
          background: 'rgb(240, 50, 50)',
        },
      },
    },
  },
})

const StatusButton = styled(ChatButton, {})
