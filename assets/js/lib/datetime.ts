const SECOND = 1000
const MINUTE = 60 * SECOND
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR
const WEEK = 7 * DAY
const YEAR = DAY * 365
const MONTH = YEAR / 12

const MIN_SECS = 60
const HOUR_SECS = 3600
const MILLI_NANOSECS = 1000000

export interface DateTime {
  seconds: number
  nanoseconds: number
}

export function toEpoch(d: DateTime): number {
  return d.seconds * 1000 + Math.floor(d.nanoseconds / 1000000)
}

export function toDate(d: DateTime): Date {
  return new Date(toEpoch(d))
}

export function now(): DateTime {
  const d = Date.now()

  return {
    seconds: d / 1000,
    nanoseconds: 0,
  }
}

export function timezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone
}

export function getLocalTime(timezone: string): string {
  const date = new Date()
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }

  return new Intl.DateTimeFormat('en-US', options).format(date)
}

const formats: [number, string, number?][] = [
  [0.7 * MINUTE, 'just now'],
  [1.5 * MINUTE, 'a minute ago'],
  [60 * MINUTE, 'minutes ago', MINUTE],
  [1.5 * HOUR, 'an hour ago'],
  [DAY, 'hours ago', HOUR],
  [2 * DAY, 'yesterday'],
  [7 * DAY, 'days ago', DAY],
  [1.5 * WEEK, 'a week ago'],
  [MONTH, 'weeks ago', WEEK],
  [1.5 * MONTH, 'a month ago'],
  [YEAR, 'months ago', MONTH],
  [1.5 * YEAR, 'a year ago'],
  [Number.MAX_VALUE, 'years ago', YEAR],
]

export function relativeDate(input: Date, reference?: Date): string {
  const delta =
    (reference ? reference.getTime() : new Date().getTime()) - input.getTime()

  for (let i = -1, len = formats.length; ++i < len; ) {
    const format = formats[i]
    if (delta < format[0]) {
      return format[2] === undefined
        ? format[1]
        : Math.round(delta / format[2]) + ' ' + format[1]
    }
  }

  return ''
}
