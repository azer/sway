import { styled } from 'themes'
import React from 'react'
import selectors from 'selectors'
import { Avatar, AvatarRoot } from '../Avatar'
import { Timestamp } from 'components/Timestamp'
// import { useSelector, useDispatch } from 'state'

interface Props {
  id: string
  username: string | undefined
  profilePhotoUrl: string | undefined
  postedAt: string | undefined
  children: React.ReactNode
}

export function ChatMessage(props: Props) {
  // const dispatch = useDispatch()
  // const [] = useSelector((state) => [])

  return (
    <Container>
      <Avatar src={props.profilePhotoUrl} fallback={props.username || ''} />
      <Right>
        <Header>
          <Author>{props.username}</Author>
          <Date>
            {props.postedAt ? <Timestamp date={props.postedAt} /> : null}
          </Date>
        </Header>
        <Body>{props.children}</Body>
      </Right>
    </Container>
  )
}

const Container = styled('div', {
  display: 'grid',
  gridTemplateColumns: '24px auto',
  gap: '8px',
  padding: '12px',
  [`& ${AvatarRoot}`]: {
    height: '24px',
    round: 'small',
  },
})

const Right = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '6px',
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

const Date = styled('div', {
  color: '$chatMessageDateFg',
  fontSize: '$small',
  fontWeight: '$medium',
  lineHeight: '16px',
})

const Body = styled('div', {
  color: '$chatMessageBodyFg',
  lineHeight: '$normal',
  whiteSpace: 'pre-wrap',
})
