import { styled } from 'themes'
import React, { useEffect, useState } from 'react'
import DailyIframe, { DailyCall } from '@daily-co/daily-js'
import { DailyProvider } from '@daily-co/daily-react-hooks'
//import selectors from 'selectors'
// import { useSelector, useDispatch } from 'state'
import { logger } from 'lib/log'

const log = logger('pip/pip-call-provider')

interface Props {
  userId: string | undefined
  roomUrl: string
  children: React.ReactNode
}

enum LoadingState {
  Ready = 'ready',
  Loading = 'loading',
  Loaded = 'loaded',
  Left = 'left',
  Joining = 'joining',
  Joined = 'joined',
}

export function PipCallProvider(props: Props) {
  // const dispatch = useDispatch()
  // const [] = useSelector((state) => [])
  const [callObject, setCallObject] = useState<DailyCall>()
  const [loadingState, setLoadingState] = useState(LoadingState.Ready)

  useEffect(() => {
    if (props.userId && props.roomUrl) {
      const callObj = createCallObject()
      setCallObject(callObj)
      joinDailyCall(callObj)
    }
  }, [props.userId, props.roomUrl])

  return <DailyProvider callObject={callObject}>{props.children}</DailyProvider>

  function createCallObject() {
    log.info('Creating call object')

    return DailyIframe.createCallObject({
      audioSource: false,
      videoSource: false,
      startVideoOff: true,
      startAudioOff: true,
    })
      .on('loading', setLoadingStateFn(LoadingState.Loading))
      .on('loaded', setLoadingStateFn(LoadingState.Loaded))
      .on('left-meeting', setLoadingStateFn(LoadingState.Left))
      .on('started-camera', logEvent)
      .on('camera-error', logEvent)
      .on('joining-meeting', setLoadingStateFn(LoadingState.Joining))
      .on('joined-meeting', setLoadingStateFn(LoadingState.Joined))
      .on('participant-updated', logEvent)
      .on('participant-joined', logEvent)
      .on('participant-left', logEvent)
      .on('active-speaker-change', logEvent)
      .on('error', logEvent)
      .on('network-connection', logEvent)
  }

  async function joinDailyCall(callObject: DailyCall) {
    callObject.setLocalVideo(false)
    callObject.setLocalAudio(false)

    await callObject.setInputDevicesAsync({
      videoSource: false,
      audioSource: false,
    })

    callObject
      .join({
        userData: { id: props.userId + ':pip' },
        url: props.roomUrl,
        videoSource: false,
        audioSource: false,
        startVideoOff: true,
        startAudioOff: true,
      })
      .then((callParticipants) => {
        log.info('Joined call:', callParticipants)
      })
      .catch((err) => {
        log.error('Error', err)
      })
  }

  function setLoadingStateFn(loadingState: LoadingState) {
    return () => {
      log.info('Setting call state as: ', loadingState)
      setLoadingState(loadingState)
    }
  }

  function handleError(err: Error) {
    log.error('Error', err)
  }
}

function logEvent(e: any) {
  log.info('Action: %s', e.action, e)
}
