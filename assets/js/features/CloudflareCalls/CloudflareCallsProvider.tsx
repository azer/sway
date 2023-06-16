import { styled } from 'themes'
import React, { useEffect, useRef } from 'react'
import selectors from 'selectors'
import { logger } from 'lib/log'
import { getPeerConn, newSession, setPeerConn } from 'lib/cloudflare'

const appId = 'aee695712a9a0c797467dcc115d45793'
const stunServer = 'stun:stun.cloudflare.com:3478'
const bundlePolicy: RTCBundlePolicy = 'max-bundle'
const log = logger('cloudflare-calls/provider')

interface Props {}

const tracks: MediaStreamTrack[] = []

export function CloudflareCallsProvider(props: Props) {
  //  const conn = useRef<RTCPeerConnection>()
  // const dispatch = useDispatch() // const [] = useSelector((state) =>[])

  useEffect(() => {
    log.info('Initializing')
    const conn = createPeerConnection(stunServer, bundlePolicy)
    setPeerConn(conn)

    establishPeerConnection(conn)
      .then(() => {
        log.info('Established peer connection')
      })
      .catch((err) => {
        log.error('Peer connection failed', err)
      })

    conn.ontrack = (event) => {
      log.info('Received track', event.track)
      tracks.push(event.track)
    }
  }, [])

  return <></>
}

function createPeerConnection(
  stunServer: string,
  bundlePolicy: RTCBundlePolicy
): RTCPeerConnection {
  const conn = new RTCPeerConnection({
    bundlePolicy,
    iceServers: [{ urls: stunServer }],
  })

  // Add receive-only transceivers so that we can start pulling remote tracks
  conn.addTransceiver('video', { direction: 'recvonly' })
  conn.addTransceiver('audio', { direction: 'recvonly' })

  return conn
}

async function establishPeerConnection(conn: RTCPeerConnection): Promise<void> {
  if (!conn.localDescription) {
    log.error('Local description missing')
    return
  }

  // Send initial offer and create session
  await conn.setLocalDescription(await conn.createOffer())
  const newSessionResult = await newSession(conn.localDescription.sdp)
  await conn.setRemoteDescription(
    new RTCSessionDescription(newSessionResult.sessionDescription)
  )

  // Establish session connection
  return new Promise((resolve, reject) => {
    console.log('Connecting...')

    conn.addEventListener('iceconnectionstatechange', (ev) => {
      const target = ev.target as EventTarget & RTCPeerConnection

      if (!target) {
        log.error('Target missing')
        return
      }

      if (target.iceConnectionState === 'connected') {
        console.log('Connected')
        resolve()
      }

      setTimeout(reject, 5000, 'Connection timeout')
    })
  })
}

function receiveRemoteTracks(conn: RTCPeerConnection) {
  return new Promise((resolve) => {
    log.info('Receiving remote tracks')

    let tracks: MediaStreamTrack[] = []
  })
}
