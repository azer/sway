import React from 'react'
import { BrowserPictureInPictureProvider } from './BrowserProvider'
import { isElectron } from 'lib/electron'
// import { useSelector, useDispatch } from 'state'

interface Props {}

export function PictureInPictureProvider(props: Props) {
  if (!isElectron) {
    return <BrowserPictureInPictureProvider />
  }
}
