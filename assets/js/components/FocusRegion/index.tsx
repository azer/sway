import { styled } from 'themes'
import React, { Ref } from 'react'

interface Props {
  regionId: string
  children: React.ReactNode
  focusSwitcher: (regionId: any) => void
  regionRef?: Ref<HTMLDivElement>
  onClick?: () => void
}

export function FocusRegion(props: Props) {
  return (
    <StyledFocusRegion
      data-region-id={props.regionId}
      onClick={onClick}
      ref={props.regionRef}
    >
      {props.children}
    </StyledFocusRegion>
  )

  function onClick() {
    props.focusSwitcher(props.regionId)
    if (props.onClick) {
      props.onClick()
    }
  }
}

export const StyledFocusRegion = styled('section', {
  display: 'block',
  width: '100%',
})
