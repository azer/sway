import { styled } from 'themes'
import { isElectron } from 'lib/electron'
import React from 'react'
import selectors from 'selectors'
import Icon from 'components/Icon'
import { useSelector, useDispatch } from 'state'
import { setSidebarOpen } from './slice'

interface Props {}

export function SidebarHeader(props: Props) {
  const dispatch = useDispatch()
  const [isOpen] = useSelector((state) => [selectors.sidebar.isOpen(state)])

  return (
    <Container electron={isElectron}>
      <Buttons>
        <Button onClick={toggle} isOpen={isOpen}>
          <Icon name="sidebar" />
        </Button>
      </Buttons>
    </Container>
  )

  function toggle() {
    dispatch(setSidebarOpen(!isOpen))
  }
}

const Container = styled('header', {
  display: 'flex',
  height: '48px',
  width: '300px',
  borderBottom: '1px solid $shellBorderColor',
  transition: 'width 0.1s ease-in-out',
  variants: {
    electron: {
      true: {
        //borderLeft: '1px solid $shellBorderColor',
      },
    },
    isOpen: {
      /*false: {
        width: '0',
        overflow: 'hidden',
      },*/
    },
  },
})

const Title = styled('div', {
  fontSize: '14px',
  fontFamily: '$sans',
  color: '$white',
  height: '100%',
  flex: '1',
  vcenter: true,
  fontWeight: '$medium',
  marginLeft: '8px',
})

const Buttons = styled('div', {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'end',
  width: '100%',
  height: '100%',
  marginRight: '8px',
})

const Button = styled('div', {
  '-webkit-app-region': 'no-drag',
  aspectRatio: '1',
  height: '24px',
  color: '$white',
  round: 'small',
  center: true,
  position: 'relative',
  '& svg': {
    aspectRatio: '1',
    height: '12px',
    transform: 'rotate(180deg)',
  },
  '&:hover': {
    background: 'rgba(255, 255, 255, 0.1)',
  },
  variants: {
    isOpen: {
      true: {
        background: 'rgba(255, 255, 255, 0.1)',
        '&::after': {
          content: ' ',
          position: 'absolute',
          width: '3px',
          height: '10px',
          background: '$white',
          right: '7px',
        },
      },
    },
  },
})
