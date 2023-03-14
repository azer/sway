import { styled } from 'themes'
import React, { Ref } from 'react'

interface Props {
  regionId: string
  children: React.ReactNode
  focusSwitcher: (regionId: any) => void
  regionRef?: Ref<HTMLDivElement>
}

export function FocusRegion(props: Props) {
  return (
    <StyledFocusRegion
      data-region-id={props.regionId}
      onClick={() => props.focusSwitcher(props.regionId)}
      ref={props.regionRef}
    >
      {props.children}
    </StyledFocusRegion>
  )
}

export const StyledFocusRegion = styled('section', {
  display: 'block',
  width: '100%',
})
