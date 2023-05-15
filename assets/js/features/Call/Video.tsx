import { styled } from 'themes'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { useMediaTrack } from '@daily-co/daily-react-hooks'
import { logger } from 'lib/log'
import {
  isElectron,
  messagePipWindow,
  messageTrayWindow,
  sendMessage,
} from 'lib/electron'
import { useSelector, useDispatch } from 'state'
import selectors from 'selectors'

const THUMBNAIL_HEIGHT = 100
const FRAME_RATE = 1 // per second

interface Props {
  participantId: string
  userId: string
  mirror?: boolean
}

const log = logger('call/video')

export const Video = React.memo(UVideo, function (prev: Props, next: Props) {
  return prev.participantId === next.participantId
})

function UVideo(props: Props) {
  const dispatch = useDispatch()
  const track = useMediaTrack(props.participantId, 'video')
  const el = useRef<HTMLVideoElement | null>(null)
  const canvasEl = useRef<HTMLCanvasElement | null>(null)
  const timer = useRef<NodeJS.Timeout | null>(null)

  const [drawing, setDrawing] = useState(false)

  const [isTrayOpen, isPipOpen] = useSelector((state) => [
    selectors.electronTray.isTrayWindowOpen(state),
    selectors.electronTray.isPipWindowOpen(state),
  ])

  useEffect(() => {
    const video = el.current

    if (!video || !track?.persistentTrack) return

    log.info('Set track', track.persistentTrack)
    /*  The track is ready to be played. We can show video of the participant in the UI. */

    video.srcObject = new MediaStream([track?.persistentTrack])
  }, [track?.persistentTrack?.id])

  useEffect(() => {
    if (!isElectron) return

    log.info('Tray open?', isTrayOpen)

    if (!isTrayOpen && timer.current !== null) {
      log.info('Stop drawing', { userId: props.userId })
      clearInterval(timer.current)
      timer.current = null
      setDrawing(false)
    } else if (isTrayOpen && timer.current === null) {
      setDrawing((drawing) => {
        if (drawing || timer.current !== null) return

        log.info(
          'Start drawing',
          drawing,
          { userId: props.userId },
          timer.current
        )

        if (timer.current) clearInterval(timer.current)

        timer.current = setInterval(draw, 1000)

        return true
      })
    }

    return () => {
      if (timer.current !== null) {
        log.info('Stop drawing before component clean up', props.userId)
        clearInterval(timer.current)
      }
    }
  }, [isTrayOpen, timer])

  log.info('Rendering video element', props.userId, track)

  const videoEl = useMemo(() => {
    log.info('Re-render element', props)
    return (
      <>
        <CallVideoRoot
          mirror={props.mirror}
          data-user-id={props.userId}
          data-participant-id={props.participantId}
          autoPlay
          muted
          playsInline
          ref={el}
        />
        <Canvas ref={canvasEl} />
      </>
    )
  }, [props.participantId])

  return videoEl

  function draw() {
    const video = el.current

    if (!video?.videoWidth || !video?.videoHeight || !canvasEl.current) {
      log.info('Video is not ready, wait a little')
      //setTimeout(draw, 1000)
      return
    }

    const aspectRatio = video.videoHeight / video.videoWidth
    const thumbnailWidth = Math.round(THUMBNAIL_HEIGHT / aspectRatio)

    /*log.info('Drawing video to canvas.', {
      participantId: props.participantId,
      aspectRatio,
      videoWidth: video?.videoWidth,
      videoHeight: video?.videoHeight,
      thumbnailWidth,
      thumbnailHeight: THUMBNAIL_HEIGHT,
    })*/

    canvasEl.current.width = thumbnailWidth
    canvasEl.current.height = THUMBNAIL_HEIGHT

    const context = canvasEl.current.getContext('2d')
    context?.drawImage(
      video,
      0,
      0,
      video.videoWidth,
      video.videoHeight,
      0,
      0,
      thumbnailWidth,
      THUMBNAIL_HEIGHT
    )

    const base64Image = canvasEl.current.toDataURL('image/jpeg')

    if (isTrayOpen) {
      messageTrayWindow({
        sendVideoFrame: {
          userId: props.userId,
          base64Image,
        },
      })
    }
  }
}

export const CallVideoRoot = styled('video', {
  width: '100%',
  height: '100%',
  'object-fit': 'cover',
  variants: {
    mirror: {
      true: {
        transform: 'rotateY(180deg)',
      },
    },
  },
})

const Canvas = styled('canvas', {
  position: 'absolute',
  minHeight: '100px',
  border: '1px solid red',
  display: 'none',
})
