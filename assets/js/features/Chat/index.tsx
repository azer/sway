import { styled } from 'themes'
import React, { useEffect, useRef } from 'react'
import selectors from 'selectors'
import { useSelector, useDispatch } from 'state'
import {
  setDraft,
  setFocusOnInput,
  setFocusOnMessage,
  setLastSeenMessage,
} from './slice'
import { useHotkeys } from 'react-hotkeys-hook'
import { getScrollPosition } from 'features/CommandPalette/Modal'
import { useChat } from './use-chat'
import { ChatMessage } from 'components/ChatMessage'
import { openUserSidebar } from 'features/Sidebar/slice'
import { setWorkspaceFocusRegion } from 'features/Workspace/slice'
import { WorkspaceFocusRegion } from 'features/Workspace/focus'
import { ChatInput, StyledChatInput } from './Input'
import { Users } from 'state/entities'

interface Props {
  roomId: string
}

export function Chat(props: Props) {
  const dispatch = useDispatch()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const chat = useChat()
  const listRef = useRef<HTMLDivElement>(null)
  const socket = useUserSocket()

  const [
    draft,
    room,
    hasFocus,
    focusOnInput,
    focusedMessageId,
    localUser,
    messageList,
    prevMessageId,
    nextMessageId,
    lastMessageId,
    focusedMessageDeleted,
  ] = useSelector((state) => [
    selectors.chat.getDraftByRoomId(state, props.roomId),
    selectors.rooms.getRoomById(state, props.roomId),
    selectors.chat.hasFocus(state),
    selectors.chat.isFocusOnInput(state),
    selectors.chat.getFocusedMessageId(state),
    selectors.users.getSelf(state),
    selectors.chat
      .getMessagesByRoomId(state, props.roomId)
      .map((id) => {
        const message = selectors.chatMessages.getById(state, id)
        return {
          id,
          message,
          user:
            (message && selectors.users.getById(state, message?.user_id)) ||
            undefined,
        }
      })
      .filter((row) => row.message?.is_active),
    selectors.chat.getPrevMessageId(state, props.roomId),
    selectors.chat.getNextMessageId(state, props.roomId),
    selectors.chat.getLastMessageId(state, props.roomId),
    selectors.chatMessages.getById(
      state,
      selectors.chat.getFocusedMessageId(state) || ''
    )?.is_active === false,
  ])

  useEffect(() => {
    if (!inputRef.current) return

    if (focusOnInput) {
      inputRef.current.focus()
    } else if (!focusOnInput) {
      inputRef.current.blur()
    }
  }, [hasFocus, focusOnInput])

  useEffect(() => {
    if (!focusedMessageDeleted) return

    if (nextMessageId) {
      dispatch(setFocusOnMessage(nextMessageId))
    } else if (prevMessageId) {
      dispatch(setFocusOnMessage(prevMessageId))
    } else {
      dispatch(setFocusOnInput())
    }
  }, [focusedMessageDeleted])

  useEffect(() => {
    if (!focusedMessageId || !listRef.current) {
      return
    }

    const scrollTop = getScrollPosition(listRef, focusedMessageId)
    if (scrollTop !== undefined) {
      listRef.current.scrollTop = scrollTop
    }
  }, [focusedMessageId])

  useEffect(() => {
    if (!lastMessageId || !listRef.current) return

    const scrollTop = getScrollPosition(listRef, lastMessageId)
    if (scrollTop !== undefined) {
      listRef.current.scrollTop = scrollTop
    }

    dispatch(
      setLastSeenMessage({ roomId: props.roomId, messageId: lastMessageId })
    )
  }, [lastMessageId])

  const missingUsers = messageList
    .filter((row) => !row.user && !!row.message)
    .map((r) => r.message?.user_id)

  useEffect(() => {
    if (!missingUsers[0]) return

    socket.fetchEntity(Users, missingUsers[0])
  }, [missingUsers[0]])

  useHotkeys(
    'enter',
    onPressEnter,
    {
      enableOnFormTags: true,
      enabled: focusOnInput,
      preventDefault: true,
      keydown: true,
    },
    [draft]
  )

  useHotkeys(
    'esc',
    onPressEsc,
    {
      enableOnFormTags: true,
      enabled: hasFocus,
    },
    [focusOnInput]
  )

  useHotkeys(
    'up, meta+up',
    onPressUp,
    {
      enabled: hasFocus && !!prevMessageId,
      preventDefault: true,
    },
    [prevMessageId, hasFocus]
  )

  useHotkeys(
    'meta+up',
    onPressCmdUp,
    {
      enableOnFormTags: true,
      keydown: true,
      enabled: focusOnInput,
      preventDefault: true,
    },
    [focusOnInput, prevMessageId]
  )

  useHotkeys(
    'down, meta+down',
    onPressDown,
    {
      enabled: hasFocus && !!focusedMessageId,
      preventDefault: true,
    },
    [focusedMessageId, nextMessageId]
  )

  return (
    <Container data-tag="chat-container" onClick={onClickContainer}>
      <MessageList
        ref={listRef}
        onClick={(e) =>
          e.target === listRef.current && inputRef.current.focus()
        }
      >
        {messageList.map((row) => (
          <ChatMessage
            key={row.id}
            id={row.id}
            username={row.user?.name}
            profilePhotoUrl={row.user?.profile_photo_url || undefined}
            focused={focusedMessageId === row.id}
            postedAt={row.message?.inserted_at}
            editedAt={row.message?.edited_at}
            ownMessage={row.user?.id === localUser?.id}
            saveMessage={(edited: string) => chat.editMessage(row.id, edited)}
            onClick={() => dispatch(setFocusOnMessage(row.id))}
            onClickUser={() =>
              row.user?.id && dispatch(openUserSidebar(row.user?.id))
            }
          >
            {row.message?.body}
          </ChatMessage>
        ))}
      </MessageList>
      <ChatInput
        focused={focusOnInput}
        inputRef={inputRef}
        value={draft}
        onFocus={onFocusInput}
        onBlur={onBlurInput}
        placeholder={`Message #${room?.name}`}
        onInput={(draft) => dispatch(setDraft({ roomId: props.roomId, draft }))}
      />
    </Container>
  )

  function onClickContainer(e: Event) {
    const target = e.target as Element
    if (target && target.getAttribute('data-tag') == 'chat-container') {
      inputRef.current?.focus()
    }
  }

  function onFocusInput() {
    dispatch(setFocusOnInput())
  }

  function onPressEsc() {
    if (focusOnInput) {
      dispatch(setWorkspaceFocusRegion(WorkspaceFocusRegion.Room))
    } else {
      dispatch(setFocusOnInput())
    }
  }

  function onPressUp() {
    if (prevMessageId) {
      dispatch(setFocusOnMessage(prevMessageId))
    }
  }

  function onPressCmdUp() {
    if (prevMessageId) {
      dispatch(setFocusOnMessage(prevMessageId))
    }
  }

  function onPressDown() {
    if (nextMessageId) {
      dispatch(setFocusOnMessage(nextMessageId))
    } else {
      dispatch(setFocusOnInput())
    }
  }

  function onBlurInput() {}
  function onPressEnter() {
    localUser?.id && chat.postMessage(localUser?.id, props.roomId, draft)
    dispatch(setDraft({ roomId: props.roomId, draft: '' }))
  }
}

const Container = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  height: 'calc(100vh - 48px)',
  gap: '12px',
  [`& > ${StyledChatInput}`]: {
    margin: '0 12px 12px 12px',
  },
})

const MessageList = styled('div', {
  flex: '1',
  scrollbar: { y: true },
})
