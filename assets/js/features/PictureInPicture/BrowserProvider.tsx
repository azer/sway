import React, { useEffect, useRef, useState } from 'react'
import selectors from 'selectors'
import { useSelector } from 'state'
import { logger } from 'lib/log'
import { PictureInPictureVideo } from './Video'

const log = logger('picture-in-picture')

interface Props { }

export function BrowserPictureInPictureProvider(props: Props) {
  const videoPlayerRef = useRef<HTMLVideoElement | null>(null)
  const [isOpen, setIsOpen] = useState(false)
  const [isDisabled, setIsDisabled] = useState(false)

  const [localStatus, visibleParticipant, windowHasFocus] = useSelector(
    (state) => [
      selectors.statuses.getLocalStatus(state),
      selectors.pip.getVisibleParticipant(state),
      selectors.focus.hasWindowFocus(state),
    ]
  )

  useEffect(() => {
    log.info('Setting up media session handlers')
    navigator.mediaSession.setActionHandler('togglemicrophone', toggleMic)
    navigator.mediaSession.setActionHandler('togglecamera', toggleCamera)
    navigator.mediaSession.setActionHandler('hangup', hangUp)
  }, [])

  useEffect(() => {
    if (isOpen && !visibleParticipant) {
      exitPiP()
    }
  }, [isOpen, !!visibleParticipant])

  useEffect(() => {
    log.info('window got focus?', windowHasFocus, visibleParticipant)

    if (!windowHasFocus && visibleParticipant && !isOpen) {
      requestPiP()
    } else if (windowHasFocus && isOpen) {
      // exitPiP()
    }

    function requestPiP() {
      if (!videoPlayerRef.current) return

      videoPlayerRef.current?.removeEventListener('loadedmetadata', requestPiP)

      log.info(
        'Requesting picture in picture',
        videoPlayerRef.current?.readyState
      )

      if (isDisabled) {
        return log.info('Disabled')
      }

      if (videoPlayerRef.current.readyState >= 1) {
        videoPlayerRef.current
          .requestPictureInPicture()
          .then(onOpen)
          .catch(onError)
      } else {
        log.error('Metadata not loaded, will try again')
        videoPlayerRef.current.addEventListener('loadedmetadata', requestPiP)
      }
    }
  }, [windowHasFocus, videoPlayerRef.current])

  useEffect(() => {
    if (!videoPlayerRef.current) return
    videoPlayerRef.current.addEventListener('leavepictureinpicture', () => {
      log.info('User left window')
      setIsDisabled(true)
    })
  }, [!!videoPlayerRef.current])

  useEffect(() => {
    setIsDisabled(false)
  }, [localStatus.camera_on || localStatus.mic_on])

  if (!visibleParticipant?.dailyUserId) return <></>

  return (
    <PictureInPictureVideo
      playerRef={videoPlayerRef}
      participantId={visibleParticipant.dailyUserId}
    />
  )

  function toggleMic() { }

  function toggleCamera() { }

  function hangUp() { }

  function onError(err: Error) {
    log.error('Error starting', err)
  }

  function onOpen() {
    log.info('open')
    setIsOpen(true)
  }

  function exitPiP() {
    document
      .exitPictureInPicture()
      .then(() => {
        setIsOpen(false)
        log.info('Closed')
      })
      .catch((err) => {
        log.error('Error closing', err)
      })
  }
}
