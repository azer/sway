import { styled } from 'themes'
import React from 'react'

export const TrayWindow = styled('main', {
  display: 'flex',
  flexDirection: 'column',
  width: '100vw',
  height: '100vh',
  overflow: 'hidden',
  color: '$electronTrayWindowFg',
  border: '0.5px solid $electronTrayWindowBorder',
})
