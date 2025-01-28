import { logger } from 'lib/log'
import React, { useEffect, useRef, useState } from 'react'
import { styled } from 'themes'

const colors = [
  'blue',
  'lightBlue',
  'darkBlue',
  'turquise',
  'purple',
  'green',
  'orange',
  'candy',
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

const log = logger('avatar/view')

export function AvatarView(props: Props) {
  const [photoLoaded, setPhotoLoaded] = useState(false)
  const color = props.name
    ? colors[(props.name.toLowerCase().charCodeAt(0) - 97) % colors.length]
    : 'gray4'

  useEffect(() => {
    if (photoLoaded || !props.photoUrl) return

    log.info('preload:', props.name, props.photoUrl)

    setPhotoLoaded(true)

    const img = new Image()
    img.src = props.photoUrl
    img.referrerPolicy = 'no-referrer'
    img.onload = function () {
      setPhotoLoaded(true)
    }
    img.onerror = function (ev) {
      log.info('Can not load image', props.name, props.photoUrl)
    }
  }, [props.photoUrl])

  return props.photoUrl && photoLoaded ? (
    <ImageAvatar
      referrerPolicy="no-referrer"
      src={props.photoUrl}
      title={props.name}
      small={props.small}
      fill={props.fill}
      css={{ round: `${props.round || 'circle'}` }}
    />
  ) : (
    <Text
      data-name={props.name}
      css={{
        backgroundColor: '$' + color,
        round: `${props.round || 'circle'}`,
      }}
      small={props.small}
      fill={props.fill}
    >
      {props.name ? props.name.slice(0, 1) : '?'}
    </Text>
  )
}

export const ImageAvatar = styled('img', {
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
        fontSize: '$small',
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
