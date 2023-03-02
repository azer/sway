import { styled } from 'themes'
import React, { useEffect, useState } from 'react'
import selectors from 'selectors'
import { useSelector } from 'state'
import { ConnectionState } from './slice'
import { useLocalParticipant } from '@daily-co/daily-react-hooks'
import { Video } from 'features/Call/Video'
import { AvatarView } from 'features/Avatar/AvatarView'
import { useVideoSettings } from 'features/Settings/VideoSettings'

interface Props {}

export function Mirror(props: Props) {
  const [user, localStatus, isActive] = useSelector((state) => [
    selectors.users.getSelf(state),
    selectors.statuses.getLocalStatus(state),
    selectors.dock.getStatusMessage(state),
    selectors.presence.isLocalUserActive(state),
  ])

  const localParticipant = useLocalParticipant()
  const cameraSettings = useVideoSettings()

  return (
    <Container onClick={cameraSettings.open}>
      {localParticipant && isActive && localStatus.camera_on ? (
        <SelfVideo>
          <Video id={localParticipant.session_id} />
        </SelfVideo>
      ) : (
        <AvatarView
          photoUrl={user?.photoUrl}
          name={user?.name}
          round="large"
          fill
        />
      )}
    </Container>
  )
}

const Container = styled('div', {
  position: 'relative',
  height: '100%',
  aspectRatio: '1 / 1',
  '& img': {
    boxShadow: 'rgb(0 0 0 / 20%) 0px 0px 4px',
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
