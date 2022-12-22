import { styled } from 'themes'
import React, { useCallback, useEffect, useState } from 'react'
import selectors from 'selectors'
import logger from 'lib/log'
import { useSelector, useDispatch } from 'state'
import {
  useParticipantIds,
  useLocalParticipant,
  useScreenShare,
  useDailyEvent,
} from '@daily-co/daily-react-hooks'
import {
  setCameraError,
  setLocalParticipantId,
  setRemoteParticipantIds,
} from './slice'
import { add, Participants, toStateEntity } from 'state/entities'
import Participant from './Participant'
import { useDaily } from '@daily-co/daily-react-hooks'

interface Props {
  roomId: string
}

const roomUrl = 'https://shtest.daily.co/bafapublic'
const log = logger('call')

export default function Call(props: Props) {
  const dispatch = useDispatch()
  const callObject = useDaily()

  const [room] = useSelector((state) => [
    selectors.rooms.getRoomById(state, props.roomId),
  ])

  const remoteParticipantIds = useParticipantIds({ filter: 'remote' })
  const localParticipant = useLocalParticipant()
  // const { screens } = useScreenShare()

  useEffect(() => {
    if (!localParticipant || !callObject) return

    //const localVideo = useVideoTrack(localParticipant?.session_id)
    //const localAudio = useAudioTrack(localParticipant?.session_id)

    callObject.setLocalVideo(true)
    callObject.join({ url: roomUrl })
  }, [localParticipant?.session_id])

  useDailyEvent(
    'camera-error',
    useCallback((event) => {
      log.error('Camera error', event)
      dispatch(setCameraError(true))
    }, [])
  )

  useEffect(() => {
    dispatch(setRemoteParticipantIds(remoteParticipantIds))
  }, remoteParticipantIds)

  useEffect(() => {
    if (!localParticipant) return

    dispatch(
      add({
        id: localParticipant.user_id,
        table: Participants,
        record: toStateEntity(Participants, localParticipant),
      })
    )
    dispatch(setLocalParticipantId(localParticipant.user_id))
  }, [localParticipant?.user_id])

  const tiling: { [k: string]: string } = {}
  if (remoteParticipantIds.length > 1) {
    tiling['gridTemplateColumns'] = `repeat(${Math.min(
      remoteParticipantIds.length,
      2
    )}, 1fr)`
  }

  return (
    <Container css={tiling}>
      {remoteParticipantIds.length > 0 &&
        remoteParticipantIds.map((id) => <Participant key={id} id={id} />)}
    </Container>
  )
}

const Container = styled('section', {
  display: 'grid',
  space: { inner: [4] },
  gap: '8px',
  height: 'calc(100vh - 200px)',
})
