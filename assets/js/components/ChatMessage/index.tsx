import { styled } from 'themes'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Avatar, AvatarRoot } from '../Avatar'
import { Timestamp } from 'components/Timestamp'
import { Tooltip } from 'components/Tooltip'
import { format } from 'date-fns'
import { useHotkeys } from 'react-hotkeys-hook'
import { ChatInput } from 'features/Chat/Input'
import { AutoLinkText } from 'components/AutoLinkText'
import { FocusItem } from 'components/FocusItem/FocusItem'

interface Props {
  id: string
  username: string | undefined
  profilePhotoUrl: string | undefined
  postedAt: string | undefined
  editedAt: string | undefined
  children: React.ReactNode
  onClick: () => void
  onClickUser: () => void
  focused: boolean
  ownMessage: boolean
  saveMessage: (draft: string) => void
}

export function ChatMessage(props: Props) {
  const [draft, setDraft] = useState(props.children)
  const [isEditing, setIsEditing] = useState(false)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  useHotkeys('esc', () => setIsEditing(false), {
    enabled: isEditing,
    enableOnFormTags: true,
    preventDefault: true,
  })

  useHotkeys(
    'enter',
    save,
    {
      enabled: isEditing,
      enableOnFormTags: true,
    },
    [draft]
  )

  useHotkeys('.', () => setIsEditing(true), {
    enabled: !isEditing && props.focused && props.ownMessage,
    enableOnFormTags: true,
  })

  useEffect(() => {
    setTimeout(() => {
      if (!inputRef.current) return
      inputRef.current.focus()

      const length = inputRef.current.value.length
      inputRef.current.setSelectionRange(length, length)
    }, 50)
  }, [isEditing])

  const date = useMemo(() => {
    if (props.postedAt) {
      const postedAt = new Date(props.postedAt)
      return format(postedAt, 'MMMM do, p')
    }

    return ''
  }, [props.postedAt])

  const emojiOnly = useMemo(() => {
    const body = props.children as string

    return (
      /\p{Extended_Pictographic}+/gu.test(body) &&
      body.replace(/\p{Extended_Pictographic}+/gu, '').trim().length <= 1 // `replace` in this line leaves 1 character left.
    )
  }, [props.id, props.children])

  return (
    <Container
      data-id={props.id}
      onClick={props.onClick}
      focused={props.focused && !isEditing}
      highlight={props.focused}
    >
      <Avatar
        onClick={props.onClickUser}
        src={props.profilePhotoUrl}
        fallback={props.username || ''}
      />
      <Right>
        <Header>
          <Author>{props.username}</Author>
          <Tooltip content={date}>
            <MessageDate>
              {props.postedAt ? <Timestamp date={props.postedAt} /> : null}
            </MessageDate>
          </Tooltip>
        </Header>
        <Body emoji={emojiOnly}>
          {isEditing ? (
            <ChatInput
              focused={isEditing}
              inputRef={inputRef}
              value={draft as string}
              onFocus={onFocusInput}
              onBlur={onBlurInput}
              onInput={(d) => setDraft(d)}
              inline
            />
          ) : (
            <>
              <AutoLinkText>{props.children}</AutoLinkText>
              {props.editedAt ? <Edited>(edited)</Edited> : null}
            </>
          )}
        </Body>
      </Right>
    </Container>
  )

  function onFocusInput() {}
  function onBlurInput() {
    setIsEditing(false)
  }

  function save() {
    setIsEditing(false)
    props.saveMessage(draft as string)
  }
}

const Right = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
})

const Container = styled(FocusItem, {
  display: 'grid',
  gridTemplateColumns: '26px auto',
  gap: '12px',
  padding: '12px',
  '&:hover': {
    background: 'rgba(245, 250, 255, 0.025)',
  },
  [`& ${AvatarRoot}`]: {
    height: '26px',
    round: 'small',
  },
  variants: {
    highlight: {
      true: {
        background: '$gray2 !important',
      },
    },
  },
})

const Header = styled('header', {
  display: 'flex',
  gap: '8px',
  label: true,
  baselineBlock: 4,
  lineHeight: '18px',
})

const Author = styled('div', {
  fontWeight: '$semibold',
  color: '$chatMessageAuthorFg',
  fontSize: '13px',
})

const MessageDate = styled('div', {
  color: '$chatMessageDateFg',
  fontSize: '$small',
  fontWeight: '$medium',
  lineHeight: '17px',
})

const Body = styled('div', {
  color: '$chatMessageBodyFg',
  lineHeight: '$normal',
  whiteSpace: 'pre-wrap',
  cursor: 'default',
  fontSize: '14px',
  variants: {
    emoji: {
      true: {
        fontSize: '24px',
      },
    },
  },
  a: {
    color: '$chatMessageLinkFg',
    textDecoration: 'none',
  },
  'a:hover': {
    textDecoration: 'underline',
  },
})

const Edited = styled('label', {
  marginLeft: '$space2',
  color: '$chatMessageEditedFg',
  fontSize: '$small',
})
