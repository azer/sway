import { logger } from './log'

const basePath = 'https://rtc.live.cloudflare.com/v1'
const prefixPath = '${basePath}/apps/${appId}'
const log = logger('cloudflare-calls/library')

let peerConn: RTCPeerConnection | undefined = undefined

interface Error {
  errorCode?: string
  errorDescription?: string
}

interface Track extends Error {
  mid: string
  trackName: string
  sessionId: string
  location?: 'local' | 'remote'
}

type LocalTrack = Pick<Track, 'trackName' | 'sessionId' | 'location'>

interface NewSessionResponse extends Error {
  requiresImmediateRenegotiation: boolean
  tracks: Track[]
  sessionDescription: RTCSessionDescription
}

interface NewTracksResponse extends Error {
  requiresImmediateRenegotiation: boolean
  tracks: Track[]
  sessionDescription: RTCSessionDescription
}

export function getPeerConn() {
  return peerConn
}

export function setPeerConn(newConn: RTCPeerConnection) {
  peerConn = newConn
}

export function newTracks(
  sessionId: string,
  tracks: LocalTrack[],
  offerSDP: string | null = null
): Promise<NewTracksResponse> {
  log.info('Creating new tracks', sessionId, tracks, offerSDP)

  return sendRequest<NewTracksResponse>(
    'POST',
    `/sessions/${sessionId}/tracks/new`,
    {
      sessionDescription: {
        type: 'offer',
        sdp: offerSDP,
      },
      tracks,
    }
  )
}

export function newSession(offerSDP: string): Promise<NewSessionResponse> {
  log.info('New session', offerSDP)

  return sendRequest<NewSessionResponse>('POST', '/sessions/new', {
    sessionDescription: {
      type: 'offer',
      sdp: offerSDP,
    },
  })
}

export function sendAnswerSDP(sessionId: string, answer: string) {
  log.info('Send answer SDP', sessionId, answer)

  return sendRequest('PUT', `/sessions/${sessionId}/renegotiate`, {
    sessionDescription: {
      type: 'answer',
      sdp: answer,
    },
  })
}

async function sendRequest<T>(method: string, url: string, body: unknown) {
  const request = {
    method,
    mode: 'cors',
    headers: {
      'content-type': 'application/json',
    },
    body: JSON.stringify(body),
  }

  const fullUrl = `${prefixPath}${url}`

  log.info('Request: %s %s', method, fullUrl)

  // @ts-ignore
  const response = await fetch(fullUrl, request)
  const result = await response.json()

  log.info('Response: %s %s', method, fullUrl, result)

  return result
}
