import { logger } from './log'

export interface APIResponseRow {
  data: unknown
  schema: string
  id: string
}

export interface APIResponse {
  result?: APIResponseRow
  list?: APIResponseRow[]
  links: APIResponseRow[]
}

const log = logger('api')

export const GET = (url: string, options?: Options) =>
  request('get', url, options)
export const POST = (url: string, options?: Options) =>
  request('post', url, options)
export const PUT = (url: string, options?: Options) =>
  request('put', url, options)

interface Options {
  body?: any
}

function request(
  method: string,
  url: string,
  options?: Options
): Promise<APIResponse> {
  log.info('Request', method, url, options)
  return fetch(url, {
    method: method,
    credentials: 'include',
    body: options?.body ? JSON.stringify(options.body) : undefined,
    headers: {
      'Content-Type': 'application/json',
      // @ts-ignore
      Authorization: `Bearer ${window.initialState.session.jwt}`,
    },
  }).then((response) => response.json<T>())
}
