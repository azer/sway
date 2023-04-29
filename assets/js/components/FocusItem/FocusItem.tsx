import { styled } from 'themes'

export const FocusItem = styled('div', {
  position: 'relative',
  '&::before': {
    content: ' ',
    position: 'absolute',
    width: '2.5px',
    height: '100%',
    background: 'transparent',
    top: '0',
    left: '0',
  },
  variants: {
    focused: {
      true: {
        '&::before': {
          background: '$focusItemBg',
        },
      },
    },
  },
})
