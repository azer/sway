import { styled } from 'themes'
import React, { useEffect } from 'react'
import selectors from 'selectors'
import { useSelector, useDispatch } from 'state'
import { setWindowFocus, setWindowVisible } from './slice'

interface Props {}

export function FocusProvider(props: Props) {
  const dispatch = useDispatch()

  useEffect(() => {
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocusChange)
    window.addEventListener('blur', handleFocusChange)

    // Cleanup event listener on unmount
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocusChange)
      window.removeEventListener('blur', handleFocusChange)
    }
  }, [])

  return <></>

  function handleVisibilityChange() {
    dispatch(setWindowVisible(!document.hidden))
  }

  function handleFocusChange() {
    dispatch(setWindowFocus(document.hasFocus()))
  }
}
