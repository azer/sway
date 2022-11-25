import React from 'react'
import { styled } from 'themes'

const colors = [
  'blue',
  'lightBlue',
  'darkBlue',
  'turquise',
  'purple',
  'green',
  'orange',
  'darkRed',
  'darkGreen',
  'gray3',
]

interface Props {
  name?: string
  photoUrl?: string
  small?: boolean
  fill?: boolean
  round?: string
}

export default function Avatar(props: Props) {
  const color = props.name
    ? colors[(props.name.toLowerCase().charCodeAt(0) - 97) % colors.length]
    : 'gray4'

  return props.photoUrl ? (
    <Image
      referrerPolicy="no-referrer"
      src={props.photoUrl}
      title={props.name}
      small={props.small}
      fill={props.fill}
      css={{ round: `${props.round || 'circle'}` }}
    />
  ) : (
    <Text
      css={{ backgroundColor: '$' + color }}
      small={props.small}
      fill={props.fill}
      css={{ round: `${props.round || 'circle'}` }}
    >
      {props.name ? props.name.slice(0, 1) : '?'}
    </Text>
  )
}

export const AvatarStack = styled('div', {
  display: 'flex',
  flexDirection: 'row-reverse',
  justifyContent: 'end',
  '& *': {
    border: '2px solid $shellBg',
  },
  '& *:not(:last-child)': {
    marginLeft: '-8px',
  },
})

export const Image = styled('img', {
  unitWidth: 6,
  unitHeight: 6,
  round: 'circle',
  aspectRatio: '1 / 1',
  variants: {
    small: {
      true: {
        unitWidth: 5,
        unitHeight: 5,
      },
    },
    fill: {
      true: {
        width: 'auto',
        height: '100%',
      },
    },
  },
})

export const Text = styled('div', {
  unitWidth: 6,
  unitHeight: 6,
  aspectRatio: '1 / 1',
  round: 'circle',
  background: '$red',
  color: '$white',
  center: true,
  fontWeight: '$medium',
  textTransform: 'uppercase',
  fontSize: '$xsmall',
  label: true,
  variants: {
    small: {
      true: {
        unitWidth: 5,
        unitHeight: 5,
      },
    },
    fill: {
      true: {
        fontSize: '24px',
        width: 'auto',
        height: '100%',
      },
    },
  },
})
