import { styled } from 'themes'
import React from 'react'
import selectors from 'selectors'
import { useSelector, useDispatch } from 'state'
import { Emoji } from 'components/Emoji'
import { relativeDate } from 'lib/datetime'

interface Props {
  id: string
}

export function StatusUpdate(props: Props) {
  // const dispatch = useDispatch()
  const [status] = useSelector((state) => [
    selectors.statuses.getById(state, props.id),
  ])

  if (!status?.message) return <></>

  return (
    <Update key={props.id}>
      {status?.emoji ? <Emoji id={status.emoji} /> : null}
      <Message>
        {status?.message}
        <Time>{status ? relativeDate(new Date(status?.inserted_at)) : ''}</Time>
      </Message>
    </Update>
  )
}

const Update = styled('div', {
  display: 'flex',
  fontSize: '$small',
  gap: '6px',
  [`& em-emoji`]: {
    fontSize: '18px',
  },
})

const Time = styled('div', {
  marginTop: '4px',
  color: 'rgba(235,  240, 255, 0.5)',
  label: true,
  '&:first-letter': {
    textTransform: 'uppercase',
  },
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
