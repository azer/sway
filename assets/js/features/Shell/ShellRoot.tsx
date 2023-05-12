import { styled } from 'themes'
import React from 'react'
import { navigationBlur1 } from 'features/Navigation'
import { globalCss } from '@stitches/react'
// import { useSelector, useDispatch } from 'state'

interface Props {
  children: React.ReactNode
  workspace?: boolean
  center?: boolean
}

export function ShellRoot(props: Props) {
  // const dispatch = useDispatch()
  // const [] = useSelector((state) => [])

  globalStyles()

  return (
    <Root workspace={props.workspace} center={props.center}>
      {props.children}
    </Root>
  )
}

const globalStyles = globalCss({
  html: {
    background: '$shellBg',
    overflow: 'hidden',
  },
  body: {
    background: '$shellBg',
    overflow: 'hidden',
  },
  '::selection': {
    background: '$textSelectionBg',
    color: '$textSelectionFg',
  },
})

const Root = styled('div', {
  width: '100vw',
  minHeight: '100vh',
  display: 'flex',
  backgroundColor: '$shellBg',
  variants: {
    workspace: {
      true: {
        backgroundImage: `${navigationBlur1}, radial-gradient(1000px at 500px -700px, $shellBlur1, transparent)`,
      },
    },
    center: {
      true: {
        center: true,
      },
    },
  },
})
