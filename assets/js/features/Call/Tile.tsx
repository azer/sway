import { styled } from 'themes'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import selectors from 'selectors'
import { Participant } from 'features/Room/RoomParticipant'
import { logger } from 'lib/log'
// import { useSelector, useDispatch } from 'state'

interface Props {
  ids: string[]
  tap: (userId: string) => void
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

    log.info('Recalculated tile', size, Math.floor(size.height / 4))

    return {
      '--tile-width': size.width + 'px',
      '--tile-height': size.height + 'px',
      '--avatar-font-size': Math.floor(size.height / 8) + 'px',
    }
  }, [props.ids.length, dimensions])

  log.info('title size', tileSizeVars)

  return (
    <Container ref={gridRef} css={tileSizeVars}>
      {props.ids.map((id, ind) => (
        <Participant data-id={id} key={id} userId={id} tap={props.tap} />
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
  gap: '8px',
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

  if (screenWidth < screenHeight && screenWidth / screenHeight < 0.75) {
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

  log.info('Tile result:', maxWidth, maxHeight, columns, rows, {
    width: maxWidth - (columns - 1) * 8,
    height: maxHeight - (rows - 1) * 8,
  })

  return {
    width: maxWidth - (columns - 1) * 8,
    height: maxHeight - (rows - 1) * 8,
  }
}
