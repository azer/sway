import React from 'react'
import * as RadixSlider from '@radix-ui/react-slider'
import { styled } from 'themes'

const Root = styled(RadixSlider.Root, {
  position: 'relative',
  display: 'flex',
  alignItems: 'center',
  userSelect: 'none',
  touchAction: 'none',
  width: '100%',
  height: '20px',
})

const Track = styled(RadixSlider.Track, {
  backgroundColor: 'rgb(212, 213, 216)',
  position: 'relative',
  flexGrow: '1',
  borderRadius: '9999px',
  height: '5px',
})

const Range = styled(RadixSlider.Range, {
  position: 'absolute',
  backgroundColor: 'rgba(167, 159, 253, 0.5)',
  height: '5px',
  borderRadius: '$small',
})

const Thumb = styled(RadixSlider.Thumb, {
  display: 'block',
  width: '24px',
  height: '24px',
  borderRadius: '100%',
  backgroundColor: '$white',
  border: '1px solid rgba(0,0,0,0.1)',
  boxShadow: 'rgba(0, 0, 0, 0.22) 0px 2px 4px',
  cursor: 'move',
  outline: 'none',
  '&:focus': {
    boxShadow: '0 0 0 3px hsla(225, 98.6%, 46.4%, 0.150)',
  },
})

const Label = styled('label', {
  position: 'absolute',
  fontSize: '$small',
  top: '-26px',
  left: '0',
  color: '$gray9',
  variants: {
    right: {
      true: {
        left: 'unset',
        right: '0',
      },
    },
  },
})

export const Slider = {
  Root: Root,
  Track: Track,
  Range: Range,
  Thumb: Thumb,
  Label: Label,
}
