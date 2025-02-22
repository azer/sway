import { styled } from 'themes'
import React from 'react'
import { Root, Image, Fallback } from '@radix-ui/react-avatar'
import { initials } from 'lib/string'

// import { useSelector, useDispatch } from 'state'

interface Props {
  alt?: string
  src?: string | null
  fallback: string
  fontSize?: string
  onClick?: () => void
}

export function Avatar(props: Props) {
  const css = { fontSize: props.fontSize || '$small' }

  return (
    <AvatarRoot css={css} onClick={props.onClick}>
      <StyledImage src={props.src} alt={props.alt} />
      <StyledFallback>{initials(props.fallback)}</StyledFallback>
    </AvatarRoot>
  )
}

export const AvatarRoot = styled(Root, {
  center: true,
  display: 'inline-flex',
  overflow: 'hidden',
  userSelect: 'none',
  height: '20px',
  aspectRatio: '1',
  fontSize: '$small',
  color: '$white',
  fontWeight: '500',
  'border-radius': '30%',
})

const StyledFallback = styled(Fallback, {
  'background-color': '$purple',
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
})

const StyledImage = styled(Image, {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
})
