import React, { useEffect, useMemo, useRef, useState } from 'react'
import { logger } from 'lib/log'
import { styled } from 'themes'

const log = logger('boxtile')
const RESIZE_DEBOUNCE_MS = 200
const TILE_GAP = 8

interface Props {
  children: React.ReactNode
  numBoxes: number
  rect?: boolean
}

export function BoxTile(props: Props) {
  // const dispatch = useDispatch()
  // const [] = useSelector((state) => [])
  const containerRef = useRef<HTMLDivElement | null>(null)
  const [dimensions, setDimensions] = useState({
    width: 1,
    height: 1,
  })

  const tileSizeVars = useMemo(() => {
    const size = getMaxSquareSize(
      dimensions.width,
      dimensions.height,
      props.numBoxes,
      TILE_GAP
    )

    log.info('Recalculated tile', size, Math.floor(size / 4))

    return {
      '--tile-box-width': size + 'px',
      '--tile-box-height': size + 'px',
      '--tile-box-cover-font-size': Math.floor(size / 8) + 'px',
      '--tile-box-label-bottom': size < 200 ? '4px' : '8px',
    }
  }, [props.numBoxes, dimensions])

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

  useEffect(() => {
    onResize(-300)
    setTimeout(onResize, 250)
  }, [])

  return (
    <StyledTile ref={containerRef} css={tileSizeVars}>
      {props.children}
    </StyledTile>
  )

  function onResize(add?: number) {
    const width = (containerRef.current?.clientWidth || 0) + (add || 0)
    const height = containerRef.current?.clientHeight
    width && height && setDimensions({ width, height })
    log.info('resized', width, height)
  }
}

const StyledTile = styled('div', {
  display: 'flex',
  flexFlow: 'row wrap',
  width: '100%',
  height: '100%',
  overflow: 'hidden',
  alignContent: 'start',
  justifyContent: 'center',
  gap: TILE_GAP,
})

function getMaxSquareSize(
  containerWidth: number,
  containerHeight: number,
  numBoxes: number,
  gap: number
): number {
  let maxBoxSize = 0

  for (let numRows = 1; numRows <= numBoxes; numRows++) {
    const numCols = Math.ceil(numBoxes / numRows)
    const availWidth = containerWidth - (numCols - 1) * gap
    const availHeight = containerHeight - (numRows - 1) * gap
    const boxWidth = availWidth / numCols
    const boxHeight = availHeight / numRows
    const boxSize = Math.min(boxWidth, boxHeight)

    if (boxSize > maxBoxSize) {
      maxBoxSize = boxSize
    }
  }

  return maxBoxSize
}

export function getMaxRectSize(
  numParticipants: number,
  containerWidth: number,
  containerHeight: number
): { width: number; height: number } {
  // Aspect ratio of each video
  const aspectRatio = 1.25

  // Determine the width and height of the available space
  let availableWidth = containerWidth
  let availableHeight = containerHeight

  // Calculate the number of columns and rows based on the number of participants
  let columns = Math.ceil(Math.sqrt(numParticipants))
  let rows = Math.ceil(numParticipants / columns)

  if (
    containerWidth < containerHeight &&
    containerWidth / containerHeight < 0.75
  ) {
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
