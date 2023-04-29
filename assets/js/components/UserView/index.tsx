import { styled } from 'themes'
import React from 'react'
import { Avatar, AvatarRoot } from 'components/Avatar'
import { UserContextMenu } from 'components/UserContextMenu'
import {
  ParticipantLabel,
  ParticipantLabelRoot,
} from 'components/ParticipantLabel'
import { StatusIcon, StyledStatusIcon } from 'features/Dock/StatusIcon'
import { Status, User } from 'state/entities'
import { UserContextMenuView } from 'components/UserContextMenu/UserContextMenuView'
import { StatusHook } from 'features/Tap/slice'
import { firstName } from 'lib/string'

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
}

export function UserIconView(props: Props) {
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
      <Root small={props.small}>
        <ParticipantLabel
          id={props.userId}
          username={props.user?.name}
        ></ParticipantLabel>
        {props.videoFrame ? <VideoFrame src={props.videoFrame} /> : null}
        {!props.videoFrame ? (
          <Avatar
            src={props.user?.profile_photo_url}
            fallback={props.user?.name || 'User ' + props.userId}
          />
        ) : null}
      </Root>
    </UserContextMenuView>
  )
}

const Root = styled('div', {
  maxWidth: '100%',
  maxHeight: '100%',
  position: 'relative',
  center: true,
  borderRadius: '1.25rem',
  aspectRatio: '1',
  round: 'xlarge',
  background: '$participantBg',
  [`& ${AvatarRoot}`]: {
    marginTop: '-10px',
    fontSize: 'var(--avatar-font-size)',
    height: '50%',
    round: true,
  },
  variants: {
    small: {
      true: {
        round: 'large',
        [`& ${ParticipantLabelRoot}`]: {
          background: 'rgb(100, 100, 100, 0.5)',
          bottom: '2px',
          zIndex: '$content',
          height: '22px',
        },
        [`& ${StyledStatusIcon}`]: {
          position: 'absolute',
          bottom: '0',
          right: '0',
          zIndex: '$content',
          border: '1.5px solid $shellBg',
          round: true,
          width: '16px',
        },
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
  position: 'absolute',
  width: '100%',
  height: '100%',
  objectFit: 'cover',
  round: 'medium',
})
