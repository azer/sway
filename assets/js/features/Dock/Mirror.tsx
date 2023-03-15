import { styled } from 'themes'
import React, { useEffect, useState } from 'react'
import selectors from 'selectors'
import { useSelector } from 'state'
import { ConnectionState } from './slice'
import { useLocalParticipant } from '@daily-co/daily-react-hooks'
import { Video } from 'features/Call/Video'
import { useVideoSettings } from 'features/Settings/VideoSettings'
import { StatusCircle, StatusIcon, StyledStatusIcon } from './StatusIcon'
import { Avatar, AvatarRoot } from 'components/Avatar'

interface Props {}

export function Mirror(props: Props) {
  // const dispatch = useDispatch()
  const [user, localStatus, connectionStatus, isActive] = useSelector(
    (state) => [
      selectors.users.getSelf(state),
      selectors.statuses.getLocalStatus(state),
      selectors.dock.getStatusMessage(state),
      selectors.presence.isLocalUserActive(state),
    ]
  )

  const localParticipant = useLocalParticipant()
  const cameraSettings = useVideoSettings()

  return (
    <Container onClick={cameraSettings.open}>
      {localParticipant && isActive && localStatus.camera_on ? (
        <SelfVideo>
          <Video id={localParticipant.session_id} />
        </SelfVideo>
      ) : (
        <Avatar src={user?.photoUrl} fallback={user?.name || 'You'} />
      )}
      <StatusIcon
        status={localStatus}
        noEmoji
        isOnline={connectionStatus.status === ConnectionState.Connected}
      />
    </Container>
  )
}

const Container = styled('div', {
  position: 'relative',
  height: '68px',
  aspectRatio: '1 / 1',
  '& img': {
    boxShadow: 'rgb(0 0 0 / 20%) 0px 0px 4px',
  },
  [`& ${AvatarRoot}`]: {
    height: '100%',
    borderRadius: '0.75rem',
  },
  [`& ${StatusCircle}`]: {
    position: 'absolute',
    bottom: '0',
    right: '0',
    width: '16px',
    height: '16px',
    aspectRatio: '1',
    border: '2px solid $dockIconBorderColor',
  },
})

const SelfVideo = styled('div', {
  height: '100%',
  aspectRatio: '1 / 1',
  overflow: 'hidden',
  round: 'large',
  center: true,
  boxShadow: 'rgb(0 0 0 / 20%) 0px 0px 4px',
  '& video': {
    width: 'auto',
    height: '100%',
  },
})
