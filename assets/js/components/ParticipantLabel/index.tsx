import { styled } from 'themes'
import React from 'react'
import { firstName } from 'lib/string'

interface Props {
  id: string
  label?: string
  username?: string
  children?: React.ReactNode
}

export function ParticipantLabel(props: Props) {
  return (
    <ParticipantLabelRoot>
      {props.children}
      <Name>
        {props.username
          ? firstName(props.username)
          : props.label || 'User ' + props.id}
      </Name>
    </ParticipantLabelRoot>
  )
}

export const ParticipantLabelRoot = styled('div', {
  maxWidth: '130px',
  vcenter: true,
  background: '$participantLabelBg',
  borderBottom: '0',
  color: '$participantLabelFg',
  position: 'absolute',
  bottom: '8px',
  borderRadius: '$medium',
  display: 'flex',
  flexDirection: 'row',
  fontSize: '$small',
  fontWeight: '$medium',
  overflow: 'hidden',
  ellipsis: true,
  gap: '6px',
  padding: '0 8px',
  height: '28px',
  zIndex: '$aboveBase',
})

const Name = styled('label', {
  display: 'block',
  label: true,
  fontWeight: '$medium',
  vcenter: true,
})
