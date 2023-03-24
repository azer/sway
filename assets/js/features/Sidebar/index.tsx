import { styled } from 'themes'
import { isElectron } from 'lib/electron'
import React, { useEffect, useState } from 'react'
import selectors from 'selectors'
import { SidebarHeader } from './Header'
import { useSelector, useDispatch } from 'state'
import { SidebarContent } from './focus'
import UserSidebar from './UserSidebar'

interface Props {}

export default function Sidebar(props: Props) {
  // const dispatch = useDispatch()
  // const [] = useSelector((state) => [])
  const [isOpen, content] = useSelector((state) => [
    selectors.sidebar.isOpen(state),
    selectors.sidebar.getContent(state),
  ])

  return (
    <Container isOpen={isOpen}>
      {content === SidebarContent.User ? <UserSidebar /> : null}
    </Container>
  )
}

const Container = styled('aside', {
  width: '300px',
  borderLeft: '1px solid $shellBorderColor',
  color: '$white',
  transition: 'width 0.1s ease-in-out',
  display: 'block',
  variants: {
    isOpen: {
      true: {
        //        width: '300px'
      },
      false: {
        width: '0',
        overflow: 'hidden',
        marginRight: '-1px',
      },
    },
  },
})
