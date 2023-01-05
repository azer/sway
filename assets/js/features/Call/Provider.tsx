import React, { useCallback, useEffect, useState } from 'react'
import selectors from 'selectors'
import DailyIframe, {
  DailyCall,
  DailyParticipantsObject,
} from '@daily-co/daily-js'
import {
  DailyProvider,
  useDailyEvent,
  useDevices,
  useParticipant,
  useParticipantIds,
} from '@daily-co/daily-react-hooks'
import { useSelector, useDispatch } from 'state'
import { logger } from 'lib/log'
import { User } from 'state/entities'
import {
  ConnectionState,
  setDailyCallConnectionStatus,
} from 'features/Dock/slice'
import {
  setCameraError,
  setParticipantStatus,
  setRemoteParticipantIds,
} from './slice'

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

  useDailyEvent(
    'camera-error',
    useCallback((event) => {
      log.error('Camera error', event)
      dispatch(setCameraError(true))
    }, [])
  )

  const handleJoiningCall = useCallback(async () => {
    if (!localUser) return

    requestAccessToInputDevices()

    log.info('Joining', localUser)

    const callObject = createCallObject()
    callObject.setLocalVideo(false)
    callObject.setLocalAudio(false)

    setCallObject(callObject)
    joinDailyCall(callObject, localUser)
  }, [localUser])

  return (
    <DailyProvider callObject={callObject}>
      {callObject ? (
        <SubscribeToDeviceSettings callObject={callObject} />
      ) : null}
      <SubscribeToRemoteParticipants />
      {props.children}
    </DailyProvider>
  )

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
      videoSource: false,
      audioSource: false,
      startVideoOff: true,
      startAudioOff: true,
    })

    callObject.setLocalVideo(false)
    callObject.setLocalAudio(false)

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

function SubscribeToRemoteParticipants() {
  const dispatch = useDispatch()
  const remoteParticipantIds = useParticipantIds({ filter: 'remote' })

  useEffect(() => {
    dispatch(setRemoteParticipantIds(remoteParticipantIds))
  }, [remoteParticipantIds])

  return (
    <>
      {remoteParticipantIds.map((id: string) => (
        <SubscribeToRemoteParticipant key={id} id={id} />
      ))}
    </>
  )
}

function SubscribeToRemoteParticipant(props: { id: string }) {
  const participant = useParticipant(props.id)
  const dispatch = useDispatch()

  useEffect(() => {
    if (!participant) return

    log.info('Sync remote partcipant call status', participant)
    // @ts-ignore
    const userId = participant.userData?.id

    dispatch(
      setParticipantStatus({
        // @ts-ignore
        userId,
        status: {
          dailyUserId: participant.user_id,
          bafaUserId: userId,
          sessionId: participant?.session_id,
          cameraOn: participant.video,
          screenOn: participant.screen,
          micOn: participant.audio,
        },
      })
    )
  }, [participant])

  return <></>
}

function SubscribeToDeviceSettings(props: { callObject: DailyCall }) {
  const { setMicrophone, setCamera, setSpeaker } = useDevices()

  const [isCameraOff, videoInputId, isMicOff, audioInputId, audioOutputId] =
    useSelector((state) => [
      selectors.settings.isVideoInputOff(state),
      selectors.settings.getVideoInputDeviceId(state),
      selectors.settings.isAudioInputOff(state),
      selectors.settings.getAudioInputDeviceId(state),
      selectors.settings.getAudioOutputDeviceId(state),
    ])

  useEffect(() => {
    log.info('Turn off video input device:', videoInputId)
    props.callObject.setLocalVideo(false)
  }, [isCameraOff])

  useEffect(() => {
    log.info('Turn off audio input device:', videoInputId)
    props.callObject.setLocalAudio(false)
  }, [isMicOff])

  useEffect(() => {
    log.info('Set video input device:', videoInputId)
    if (videoInputId && !isCameraOff) {
      setCamera(videoInputId)
      props.callObject.setLocalVideo(true)
    }
  }, [videoInputId, isCameraOff])

  useEffect(() => {
    log.info('Set audio input device:', audioOutputId)
    if (audioInputId && !isMicOff) {
      setMicrophone(audioInputId)
      props.callObject.setLocalAudio(true)
    }
  }, [audioInputId, isMicOff])

  useEffect(() => {
    log.info('Set audio output device:', audioOutputId)
    if (audioOutputId) {
      setSpeaker(audioOutputId)
    }
  }, [audioOutputId])

  return <></>
}
