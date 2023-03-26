import { logger } from './log'

const log = logger('api')

export const GET = <T>(url: string, options?: Options) =>
  request<T>('get', url, options)
export const POST = (url: string, options?: Options) =>
  request('post', url, options)
export const PUT = (url: string, options?: Options) =>
  request('put', url, options)

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
