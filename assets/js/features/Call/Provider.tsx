import { styled } from 'themes'
import React, { useCallback, useEffect, useState } from 'react'
import selectors from 'selectors'
import DailyIframe, {
  DailyCall,
  DailyParticipantsObject,
} from '@daily-co/daily-js'
import { DailyProvider } from '@daily-co/daily-react-hooks'
import { useSelector, useDispatch } from 'state'
import { logger } from 'lib/log'
import { Participant, User } from 'state/entities'
import {
  ConnectionState,
  setDailyCallConnectionStatus,
} from 'features/Status/slice'
import { setParticipantStatus } from './slice'

interface Props {
  children: React.ReactNode
}

const log = logger('call/provider')
const roomUrl = 'https://shtest.daily.co/bafapublic'

export function CallProvider(props: Props) {
  const dispatch = useDispatch()
  const [callObject, setCallObject] = useState<DailyCall>()

  const [localUser] = useSelector((state) => [selectors.users.getSelf(state)])

  useEffect(() => {
    log.info('Establishing call provider', localUser)
    if (!localUser) return

    dispatch(
      setDailyCallConnectionStatus({
        userId: localUser.id,
        state: ConnectionState.Connecting,
      })
    )

    handleJoiningCall()
  }, [localUser])

  const handleJoiningCall = useCallback(async () => {
    if (!localUser) return

    requestAccessToInputDevices()

    log.info('Joining', localUser)

    const callObject = createCallObject()
    setCallObject(callObject)
    joinDailyCall(callObject, localUser)
  }, [localUser])

  return <DailyProvider callObject={callObject}>{props.children}</DailyProvider>

  function createCallObject() {
    return DailyIframe.createCallObject({
      audioSource: false,
      videoSource: false,
      startVideoOff: true,
      startAudioOff: true,
    })
      .on('loading', logEvent)
      .on('loaded', logEvent)
      .on('left-meeting', logEvent)
      .on('started-camera', logEvent)
      .on('camera-error', logEvent)
      .on('joining-meeting', logEvent)
      .on('joined-meeting', logEvent)
      .on('participant-updated', logEvent)
      .on('participant-joined', logEvent)
      .on('participant-left', logEvent)
      .on('error', logEvent)
      .on('network-connection', logEvent)
  }

  async function joinDailyCall(callObject: DailyCall, user: User) {
    const callParticipants = await callObject.join({
      userData: { id: localUser?.id },
      url: roomUrl,
    })

    if (!callParticipants) {
      handleJoinError(user)
    } else {
      handleJoinSuccess(user, callParticipants)
    }
  }

  function handleJoinError(user: User) {
    log.error('Failed to join call', user)
  }

  function handleJoinSuccess(
    user: User,
    callParticipants: DailyParticipantsObject
  ) {
    dispatch(
      setDailyCallConnectionStatus({
        userId: user.id,
        state: ConnectionState.Successful,
      })
    )

    dispatch(
      setParticipantStatus({
        userId: user.id,
        status: {
          dailyUserId: callParticipants.local.user_id,
          bafaUserId: user.id,
          sessionId: callParticipants.local.session_id,
          cameraOn: callParticipants.local.video,
          screenOn: callParticipants.local.screen,
          micOn: callParticipants.local.audio,
        },
      })
    )
  }

  async function requestAccessToInputDevices() {
    await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
  }
}

function logEvent(e: any) {
  log.info('Daily event. Action: %s', e.action, e)
}
