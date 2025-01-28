import { styled } from 'themes'
import React from 'react'
import selectors from 'selectors'
import { useSelector, useDispatch } from 'state'
import { Emoji } from 'components/Emoji'
import { relativeDate } from 'lib/datetime'
import Icon from 'components/Icon'

interface Props {
  id: string
  showUser?: boolean
}

export function StatusUpdate(props: Props) {
  // const dispatch = useDispatch()
  const [status, username] = useSelector((state) => [
    selectors.status.getById(state, props.id),
    selectors.users.getById(
      state,
      selectors.status.getById(state, props.id)?.user_id || ''
    )?.name,
  ])

  if (!status?.message) return <></>

  return (
    <Update key={props.id}>
      {status?.emoji ? (
        <Emoji id={status.emoji} />
      ) : (
        <NoEmoji>
          <Icon name="emoji" />
        </NoEmoji>
      )}
      <Message>
        {status?.message}
        <Footer>
          {props.showUser ? <Username>{username}</Username> : null}
          <Time>
            {status ? relativeDate(new Date(status?.inserted_at)) : ''}
          </Time>
        </Footer>
      </Message>
    </Update>
  )
}

const Update = styled('div', {
  display: 'flex',
  fontSize: '$small',
  gap: '6px',
  [`& em-emoji`]: {
    width: '18px',
    fontSize: '18px',
    label: true,
  },
})

const Time = styled('div', {
  color: 'rgba(235,  240, 255, 0.5)',
  label: true,
  '&:first-letter': {
    textTransform: 'uppercase',
  },
})

const Footer = styled('footer', {
  display: 'flex',
  gap: '4px',
  marginTop: '4px',
})

const Username = styled('div', {
  color: '$gray9',
  fontWeight: '$semibold',
})

const Message = styled('div', {
  display: 'flex',
  flexDirection: 'column',
})

export const Updates = styled('div', {
  display: 'flex',
  flexDirection: 'column',
  gap: '12px',
  flexGrow: '1',
  overflowX: 'hidden',
  scrollbar: { y: true },
})

const NoEmoji = styled('span', {
  display: 'flex',
  width: '18px',
  color: '$gray4',
  alignItems: 'start',
  '& svg': {
    height: '18px',
  },
})
