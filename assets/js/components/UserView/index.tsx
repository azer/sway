import { styled } from 'themes'
import React, { useMemo } from 'react'
import { Avatar, AvatarRoot } from 'components/Avatar'
import { Status, User } from 'state/entities'
import { UserContextMenuView } from 'components/UserContextMenu/UserContextMenuView'
import { StatusHook } from 'features/Tap/slice'
import { participantLabelBg } from 'themes/colors'
import { firstName } from 'lib/string'
import { stringToRGB } from 'lib/colors'
import { PictureInPictureVideo } from 'features/PictureInPicture/Video'

interface Props {
  userId: string
  user?: User
  status?: Status
  small?: boolean
  tap: (userId: string) => void
  existingHook?: StatusHook
  isOnline: boolean
  createStatusHook: (userId: string) => void
  videoFrame?: string
  videoParticipantId?: string
  self?: boolean
  tile?: boolean
}

export function UserIconView(props: Props) {
  const color = useMemo(() => {
    return stringToRGB(props.user?.name || props.userId, participantLabelBg)
  }, [props.userId])

  return (
    <UserContextMenuView
      userId={props.userId}
      user={props.user}
      status={props.status}
      tap={props.tap}
      existingHook={props.existingHook}
      isOnline={props.isOnline}
      createStatusHook={props.createStatusHook}
    >
      <StyledUserIconView small={props.small} tile={props.tile}>
        <Label
          tile={props.tile}
          css={{
            backgroundColor: color,
          }}
        >
          {firstName(props.user?.name || '')}
        </Label>
        {props.videoFrame ? (
          <VideoFrame src={props.videoFrame} mirror={props.self} />
        ) : null}
        {props.videoParticipantId ? (
          <PictureInPictureVideo
            participantId={props.videoParticipantId}
            mirror={props.self}
          />
        ) : null}
        {!props.videoFrame ? (
          <Avatar
            src={props.user?.profile_photo_url}
            fallback={props.user?.name || 'User ' + props.userId}
          />
        ) : null}
      </StyledUserIconView>
    </UserContextMenuView>
  )
}

export const StyledUserIconView = styled('div', {
  maxWidth: '100%',
  maxHeight: '100%',
  position: 'relative',
  center: true,
  borderRadius: '1.25rem',
  aspectRatio: '1',
  round: 'xlarge',
  background: '$participantBg',
  zIndex: '$base',
  overflow: 'hidden',
  [`& ${AvatarRoot}`]: {
    marginTop: '-10px',
    fontSize: 'var(--avatar-font-size)',
    height: '50%',
    round: true,
  },
  [`& video`]: {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    zIndex: '$base',
  },
  variants: {
    tile: {
      true: {
        width: 'var(--tile-box-width)',
        height: 'var(--tile-box-height)',
      },
    },
    small: {
      true: {
        round: 'large',
        [`${AvatarRoot}`]: {
          margin: '0',
          height: '100%',
          aspectRatio: '1',
          round: 'large',
          zIndex: '0',
        },
      },
    },
  },
})

const VideoFrame = styled('img', {
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  round: 'medium',
  variants: {
    mirror: {
      true: {
        transform: 'rotateY(180deg)',
      },
    },
  },
})

export const Label = styled('div', {
  position: 'absolute',
  bottom: '10px',
  background: 'rgb(80, 90, 100, 0.9)',
  padding: '4px 6px',
  zIndex: '$aboveBase',
  fontSize: '$small',
  round: 'small',
  label: true,
  variants: {
    tile: {
      true: {
        bottom: 'var(--tile-box-label-bottom)',
      },
    },
  },
})
