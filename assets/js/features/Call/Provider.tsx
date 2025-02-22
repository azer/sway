import React, { useCallback, useEffect, useRef, useState } from 'react'
import selectors from 'selectors'
import DailyIframe, {
  DailyCall,
  DailyEvent,
  DailyParticipantsObject,
} from '@daily-co/daily-js'
import {
  DailyProvider,
  useDaily,
  useDailyEvent,
  useDevices,
  useLocalParticipant,
  useParticipant,
  useParticipantIds,
} from '@daily-co/daily-react-hooks'
import { useSelector, useDispatch } from 'state'
import { User, Workspace } from 'state/entities'
import {
  ConnectionState,
  setDailyCallConnectionStatus,
} from 'features/Dock/slice'
import { setParticipantStatus, setRemoteParticipantIds } from './slice'
import { setVideoInputError } from 'features/Settings/slice'
import { logger } from 'lib/log'

interface Props {
  children: React.ReactNode
}

const log = logger('call/provider')
const dlog = logger('daily')

export function CallProvider(props: Props) {
  const dispatch = useDispatch()
  const [callObject, setCallObject] = useState<DailyCall>()
  const retryTimer = useRef<NodeJS.Timer | null>()

  const [workspace, localUser, shouldReconnect] = useSelector((state) => [
    selectors.workspaces.getSelfWorkspace(state),
    selectors.users.getSelf(state),
    selectors.call.shouldReconnect(state),
  ])

  useEffect(() => {
    if (!callObject || !localUser || !workspace || !shouldReconnect) {
      log.info('Reconnecting')
      return
    }

    let delay = 100
    let device = 200

    if (retryTimer.current !== null) {
      clearTimeout(retryTimer.current)
      retryTimer.current = null
      delay = 3000
    }

    retryTimer.current = setTimeout(() => {
      retryTimer.current = null

      log.info('Retry...')

      dispatch(
        setDailyCallConnectionStatus({
          userId: localUser.id,
          state: ConnectionState.Retry,
        })
      )

      joinDailyCall(callObject, localUser, workspace)
    }, delay)

    return () => {
      if (retryTimer.current !== null) {
        clearTimeout(retryTimer.current)
        retryTimer.current = null
      }
    }
  }, [callObject, !!localUser, !!workspace, shouldReconnect])

  useEffect(() => {
    if (!localUser) return

    log.info('Establishing call provider', localUser)

    handleJoiningCall()
  }, [localUser])

  useDailyEvent(
    'camera-error',
    useCallback((event) => {
      log.error('Camera error', event)
      dispatch(setVideoInputError(true))
    }, [])
  )

  const handleJoiningCall = useCallback(async () => {
    if (!localUser || !workspace) return

    dispatch(
      setDailyCallConnectionStatus({
        userId: localUser.id,
        state: ConnectionState.Connecting,
      })
    )

    log.info('Joining', localUser)

    const callObject = createCallObject()
    callObject.setLocalVideo(false)
    callObject.setLocalAudio(false)

    setCallObject(callObject)
    joinDailyCall(callObject, localUser, workspace)
  }, [localUser, workspace])

  return (
    <DailyProvider callObject={callObject}>
      {callObject ? (
        <SubscribeToDeviceSettings callObject={callObject} />
      ) : null}
      <SubscribeToRemoteParticipants />
      <SubscribeToLocalParticipantState />
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
      .on('loading', updateLocalDailyState)
      .on('loaded', updateLocalDailyState)
      .on('left-meeting', updateLocalDailyState)
      .on('started-camera', logEvent)
      .on('camera-error', logEvent)
      .on('joining-meeting', updateLocalDailyState)
      .on('joined-meeting', updateLocalDailyState)
      .on('participant-updated', logEvent)
      .on('participant-joined', logEvent)
      .on('participant-left', logEvent)
      .on('active-speaker-change', logEvent)
      .on('error', logEvent)
      .on('network-connection', logEvent)
  }

  async function joinDailyCall(
    callObject: DailyCall,
    user: User,
    workspace: Workspace
  ) {
    callObject.setLocalVideo(false)
    callObject.setLocalAudio(false)

    await callObject.setInputDevicesAsync({
      videoSource: false,
      audioSource: false,
    })

    callObject
      .join({
        userData: { id: localUser?.id },
        url: workspace.daily_room_url,
        videoSource: false,
        audioSource: false,
        startVideoOff: true,
        startAudioOff: true,
      })
      .then((callParticipants) => {
        if (!callParticipants) {
          handleJoinError(user)
        } else {
          handleJoinSuccess(user, callParticipants)
        }
      })
  }

  function updateLocalDailyState(event?: any) {
    log.info(
      'Event triggered updating local daily state',
      callObject?.meetingState(),
      event
    )
  }

  function handleJoinError(user: User) {
    setDailyCallConnectionStatus({
      state: ConnectionState.Failed,
      userId: user.id,
    })
  }

  function handleJoinSuccess(
    user: User,
    callParticipants: DailyParticipantsObject
  ) {
    dispatch(
      setDailyCallConnectionStatus({
        userId: user.id,
        state: ConnectionState.Connected,
      })
    )

    dispatch(
      setParticipantStatus({
        userId: user.id,
        status: {
          dailyUserId: callParticipants.local.user_id,
          swayUserId: user.id,
          sessionId: callParticipants.local.session_id,
          cameraOn: callParticipants.local.video,
          screenOn: callParticipants.local.screen,
          micOn: callParticipants.local.audio,
        },
      })
    )
  }

  function logEvent(e: any) {
    dlog.info('Action: %s', e.action, e)
  }
}

function SubscribeToLocalParticipantState() {
  const call = useDaily()
  const dispatch = useDispatch()
  const localParticipant = useLocalParticipant()

  const [userId] = useSelector((state) => [selectors.users.getSelf(state)?.id])

  useEffect(() => {
    if (!call || !userId) return

    const meetingState = call.meetingState()
    switch (meetingState) {
      case 'joining-meeting':
        dispatch(
          setDailyCallConnectionStatus({
            userId,
            state: ConnectionState.Connecting,
          })
        )
        break
      case 'joined-meeting':
        dispatch(
          setDailyCallConnectionStatus({
            userId,
            state: ConnectionState.Connected,
          })
        )
        break
      case 'left-meeting':
        dispatch(
          setDailyCallConnectionStatus({
            userId,
            state: ConnectionState.Disconnected,
          })
        )
        break
    }
  }, [userId, localParticipant, call])

  return <></>
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
          swayUserId: userId,
          sessionId: participant?.session_id,
          cameraOn: participant.video,
          screenOn: participant.screen,
          micOn: participant.audio,
        },
      })
    )
  }, [
    participant?.user_id,
    participant?.video,
    participant?.screen,
    participant?.audio,
    participant?.session_id,
  ])

  return <></>
}

function SubscribeToDeviceSettings(props: { callObject: DailyCall }) {
  const { setMicrophone, setCamera, setSpeaker, cameras } = useDevices()

  const [localPresence, videoInputId, audioInputId, audioOutputId] =
    useSelector((state) => [
      selectors.status.getLocalStatus(state),
      selectors.settings.getVideoInputDeviceId(state),
      selectors.settings.getAudioInputDeviceId(state),
      selectors.settings.getAudioOutputDeviceId(state),
    ])

  useEffect(() => {
    if (!localPresence.camera_on) {
      log.info('Turn off video input device')
      props.callObject.setLocalVideo(false)
      props.callObject.setInputDevices({
        videoSource: false,
      })
    } else if (localPresence.camera_on && videoInputId) {
      log.info('Turn on local video input', videoInputId, cameras)
      props.callObject.setLocalVideo(true)
      setCamera(videoInputId)
        .then(() => {
          log.info('Video input updated')
        })
        .catch((err) => {
          log.error('Video input change error', err)
        })
    }
  }, [localPresence.camera_on, videoInputId])

  useEffect(() => {
    if (!localPresence.mic_on) {
      log.info('Turn off audio input device:')
      props.callObject.setLocalAudio(false)
      const newCallObj = props.callObject.setInputDevices({
        audioSource: false,
      })
    } else if (localPresence.mic_on && audioInputId) {
      log.info('Turn on local audio input', audioInputId)
      setMicrophone(audioInputId)
      props.callObject.setLocalAudio(true)
    }
  }, [localPresence.mic_on, audioInputId])

  useEffect(() => {
    if (audioOutputId) {
      log.info('Set audio output device:', audioOutputId)
      setSpeaker(audioOutputId)
    }
  }, [audioOutputId])

  return <></>
}
