import { RoomStatus } from 'features/Room/selectors'
import { styled } from 'themes'

export const RoomStatusIcon = styled('div', {
  width: '8px',
  height: '8px',
  round: 'xsmall',
  variants: {
    mode: {
      [RoomStatus.Offline]: {
        backgroundColor: 'rgba(255, 255, 255, 0.1)',
      },
      [RoomStatus.Focus]: {
        backgroundColor: '$yellow',
      },
      [RoomStatus.Active]: {
        backgroundColor: '$green',
      },
    },
  },
})
