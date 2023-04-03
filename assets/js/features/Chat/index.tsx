import { styled } from 'themes'
import React, { useEffect, useRef } from 'react'
import selectors from 'selectors'
import { TextField, TextfieldInput, TextFieldRoot } from 'components/TextField'
import { useSelector, useDispatch } from 'state'
import { setDraft, setFocusOnInput, setFocusOnMessage } from './slice'
import { useHotkeys } from 'react-hotkeys-hook'
import { useUserSocket } from 'features/UserSocket'
import { Border, getScrollPosition } from 'features/CommandPalette/Modal'
import { useChat } from './use-chat'
import { Avatar } from 'components/Avatar'
import { ChatMessage } from 'components/ChatMessage'
import { openUserSidebar } from 'features/Sidebar/slice'
import { setWorkspaceFocusRegion } from 'features/Workspace/slice'
import { WorkspaceFocusRegion } from 'features/Workspace/focus'

interface Props {
  roomId: string
}

export function Chat(props: Props) {
  const dispatch = useDispatch()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const chat = useChat()
  const listRef = useRef<HTMLDivElement>(null)

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
  ] = useSelector((state) => [
    selectors.chat.getDraftByRoomId(state, props.roomId),
    selectors.rooms.getRoomById(state, props.roomId),
    selectors.chat.hasFocus(state),
    selectors.chat.isFocusOnInput(state),
    selectors.chat.getFocusedMessageId(state),
    selectors.users.getSelf(state),
    selectors.chat.getMessagesByRoomId(state, props.roomId).map((id) => {
      const message = selectors.chatMessages.getById(state, id)
      return {
        id,
        message,
        user:
          (message && selectors.users.getById(state, message?.user_id)) ||
          undefined,
      }
    }),
    selectors.chat.getPrevMessageId(state, props.roomId),
    selectors.chat.getNextMessageId(state, props.roomId),
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
    if (!focusedMessageId || !listRef.current) {
      return
    }

    const scrollTop = getScrollPosition(listRef, focusedMessageId)
    if (scrollTop !== undefined) {
      listRef.current.scrollTop = scrollTop
    }
  }, [focusedMessageId])

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
      //enableOnFormTags: true,
      //keydown: true,
      enabled: hasFocus && !!focusedMessageId,
      preventDefault: true,
    },
    [focusedMessageId, nextMessageId]
  )

  return (
    <Container>
      <MessageList ref={listRef}>
        {messageList.map((row) => (
          <ChatMessage
            key={row.id}
            id={row.id}
            username={row.user?.name}
            profilePhotoUrl={row.user?.profile_photo_url || undefined}
            focused={focusedMessageId === row.id}
            postedAt={row.message?.inserted_at}
            onClick={() => dispatch(setFocusOnMessage(row.id))}
            onClickUser={() =>
              row.user?.id && dispatch(openUserSidebar(row.user?.id))
            }
          >
            {row.message?.body}
          </ChatMessage>
        ))}
      </MessageList>
      <Compose focused={focusOnInput}>
        <TextField
          inputRef={inputRef}
          value={draft}
          onFocus={onFocusInput}
          onBlur={onBlurInput}
          placeholder={`Message #${room?.name}`}
          onInput={(draft) =>
            dispatch(setDraft({ roomId: props.roomId, draft }))
          }
        />
      </Compose>
    </Container>
  )

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
})

const MessageList = styled('div', {
  flex: '1',
  overflowY: 'scroll',
})

const Compose = styled('div', {
  margin: '0 12px',
  marginBottom: '12px',
  lineHeight: '$relaxed',
  fontSize: '$base',
  fontFamily: '$sans',
  color: '$red',
  [`& ${TextFieldRoot}`]: {
    padding: '8px 16px',
    background: '$chatInputBg',
    round: 'medium',
    border: '0.5px solid transparent',
    position: 'relative',
  },
  [`& ${TextfieldInput}`]: {
    color: '$chatInputFg',
    lineHeight: '$relaxed',
    fontSize: '$base',
    caretColor: '$chatInputCaret',
  },
  [`& ${TextFieldRoot}::before`]: {
    position: 'absolute',
    height: '100%',
    content: ' ',
    width: '3.5px',
    background: 'transparent',

    borderBottomLeftRadius: '$medium',
    borderTopLeftRadius: '$medium',
  },
  [`& ${TextFieldRoot}::after`]: {
    fontSize: '$base',
    lineHeight: '$relaxed',
    margin: '2px 0 0 2px',
  },
  variants: {
    focused: {
      true: {
        [`& ${TextFieldRoot}`]: {
          background: '$chatInputFocusBg',
          color: '$chatInputFocusFg',
          borderColor: 'rgba(82, 82, 111, 0.44)',
          boxShadow: 'rgb(1 4 12 / 50%) 0px 0px 15px',
        },

        [`& ${TextFieldRoot}::before`]: {
          background: `radial-gradient(circle farthest-corner at 0px 0px, $lightPurple, transparent), radial-gradient(circle farthest-corner at 0px 90%, $candy, transparent)`,
        },
        [`& ${TextfieldInput}`]: {
          color: '$chatInputFocusFg',
        },
      },
    },
  },
})
