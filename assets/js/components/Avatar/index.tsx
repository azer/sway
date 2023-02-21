import { styled } from 'themes'
import React from 'react'
import { Root, Image, Fallback } from '@radix-ui/react-avatar'

// import { useSelector, useDispatch } from 'state'

interface Props {
  alt?: string
  src: string
  fallback: string
}

export function Avatar(props: Props) {
  return (
    <StyledRoot>
      <Image src={props.src} alt={props.alt} />
      <Fallback>{props.fallback}</Fallback>
    </StyledRoot>
  )
}

const StyledRoot = styled(Root, {
  center: true,
  display: 'inline-flex',
  overflow: 'hidden',
  userSelect: 'none',
  height: '20px',
  aspectRatio: '1',
  fontSize: '12px',
  color: '$white',
  fontWeight: '500',
  'border-radius': '30%',
  'background-color': '$red',
})
