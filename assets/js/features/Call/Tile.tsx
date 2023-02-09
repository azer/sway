import { styled } from 'themes'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import selectors from 'selectors'
import { Participant } from 'features/Room/RoomParticipant'
import { logger } from 'lib/log'
// import { useSelector, useDispatch } from 'state'

interface Props {
  ids: string[]
}

const log = logger('call/tile')
const RESIZE_DEBOUNCE_MS = 200

export function CallTile(props: Props) {
  // const dispatch = useDispatch()
  // const [] = useSelector((state) => [])

  const [dimensions, setDimensions] = useState({
    width: 1,
    height: 1,
  })

  const gridRef = useRef<HTMLDivElement | null>(null)

  // Update width and height of grid when window is resized
  useEffect(() => {
    let frame: NodeJS.Timeout | undefined

    const handleResize = () => {
      if (frame) {
        clearTimeout(frame)
      }

      frame = setTimeout(() => onResize(), RESIZE_DEBOUNCE_MS)
    }

    handleResize()
    window.addEventListener('resize', handleResize)
    window.addEventListener('orientationchange', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('orientationchange', handleResize)
    }
  }, [])

  const tileSizeVars = useMemo(() => {
    const size = calcTileSize(
      props.ids.length,
      dimensions.width,
      dimensions.height
    )

    log.info('Recalculated tile', size)

    return {
      '--tile-width': size.width + 'px',
      '--tile-height': size.height + 'px',
    }
  }, [props.ids.length, dimensions])

  return (
    <Container ref={gridRef} css={tileSizeVars}>
      {props.ids.map((id) => (
        <Participant data-id={id} key={id} userId={id} />
      ))}
    </Container>
  )

  function onResize() {
    const width = gridRef.current?.clientWidth
    const height = gridRef.current?.clientHeight
    width && height && setDimensions({ width, height })
    log.info('resized', width, height)
  }
}

const Container = styled('main', {
  width: '100%',
  overflow: 'hidden',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  flexWrap: 'wrap',
  alignContent: 'center',
})

function calcTileSize(
  numParticipants: number,
  screenWidth: number,
  screenHeight: number
): { width: number; height: number } {
  // Aspect ratio of each video
  const aspectRatio = 1.25

  // Determine the width and height of the available space
  let availableWidth = screenWidth
  let availableHeight = screenHeight

  // Calculate the number of columns and rows based on the number of participants
  let columns = Math.ceil(Math.sqrt(numParticipants))
  let rows = Math.ceil(numParticipants / columns)

  if (screenWidth < screenHeight && screenWidth / screenHeight < 0.6) {
    columns = 1
    rows = numParticipants
  }

  // Determine the maximum width and height of each video
  let maxWidth = availableWidth / columns
  let maxHeight = availableHeight / rows

  // If the calculated height exceeds the aspect ratio, adjust the height and width
  if (maxHeight > maxWidth / aspectRatio) {
    maxHeight = maxWidth / aspectRatio
  } else {
    maxWidth = maxHeight * aspectRatio
  }

  return { width: maxWidth, height: maxHeight }
}
