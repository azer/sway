import { styled } from 'themes'
import React, { useMemo } from 'react'
import selectors from 'selectors'
import { Avatar, AvatarRoot } from '../Avatar'
import { Timestamp } from 'components/Timestamp'
import { Tooltip } from 'components/Tooltip'
import { format } from 'date-fns'
// import { useSelector, useDispatch } from 'state'

interface Props {
  id: string
  username: string | undefined
  profilePhotoUrl: string | undefined
  postedAt: string | undefined
  children: React.ReactNode
  onClick: () => void
  onClickUser: () => void
  focused: boolean
}

export function ChatMessage(props: Props) {
  // const dispatch = useDispatch()
  // const [] = useSelector((state) => [])

  const date = useMemo(() => {
    if (props.postedAt) {
      const postedAt = new Date(props.postedAt)
      return format(postedAt, 'MMMM do, p')
    }

    return ''
  }, [props.postedAt])

  return (
    <Container onClick={props.onClick} focused={props.focused}>
      <Avatar
        onClick={props.onClickUser}
        src={props.profilePhotoUrl}
        fallback={props.username || ''}
      />
      <Right>
        <Header>
          <Author onClick={props.onClickUser}>{props.username}</Author>
          <Tooltip content={date}>
            <MessageDate>
              {props.postedAt ? <Timestamp date={props.postedAt} /> : null}
            </MessageDate>
          </Tooltip>
        </Header>
        <Body>{props.children}</Body>
      </Right>
    </Container>
  )
}

const Container = styled('div', {
  display: 'grid',
  gridTemplateColumns: '26px auto',
  gap: '12px',
  padding: '12px',
  [`& ${AvatarRoot}`]: {
    height: '26px',
    round: 'small',
  },
  variants: {
    focused: {
      true: {
        background: '$gray2',
      },
    },
  },
})

const Right = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '4px',
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
  fontSize: '$base',
})

const MessageDate = styled('div', {
  color: '$chatMessageDateFg',
  fontSize: '$small',
  fontWeight: '$medium',
  lineHeight: '16px',
})

const Body = styled('div', {
  color: '$chatMessageBodyFg',
  lineHeight: '$normal',
  whiteSpace: 'pre-wrap',
  cursor: 'default',
})
