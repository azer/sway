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

export const GET = <T>(url: string, options?: Options) =>
  request<T>('get', url, options)
export const POST = <T>(url: string, options?: Options) =>
  request<T>('post', url, options)
export const PUT = <T>(url: string, options?: Options) =>
  request<T>('put', url, options)

interface Options {
  body?: any
}

function request<T>(
  method: string,
  url: string,
  options?: Options
): Promise<T> {
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
