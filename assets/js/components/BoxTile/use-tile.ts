import { logger } from 'lib/log'
import { useEffect, useMemo, useState } from 'react'

const RESIZE_DEBOUNCE_MS = 200

export function useTile(
  containerRef: React.MutableRefObject<HTMLDivElement>,
  numBoxes: number
) {
  const log = logger('tile')

  const [dimensions, setDimensions] = useState({
    width: 1,
    height: 1,
  })

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

      clearTimeout(frame)
    }
  }, [])

  return useMemo(() => {
    const size = calcTileSize(numBoxes, dimensions.width, dimensions.height)

    log.info('Recalculated tile', size, Math.floor(size.height / 4))

    return {
      '--tile-box-width': size.width + 'px',
      '--tile-box-height': size.height + 'px',
      '--tile-box-avatar-font-size': Math.floor(size.height / 8) + 'px',
      '--tile-box-avatar-size':
        Math.max(Math.floor(size.height / 4), 200) + 'px',
    }
  }, [numBoxes, dimensions])

  function onResize(add?: number) {
    const width = (containerRef.current?.clientWidth || 0) + (add || 0)
    const height = containerRef.current?.clientHeight
    width && height && setDimensions({ width, height })
  }
}

export function calcTileSize(
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
