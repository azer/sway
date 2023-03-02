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
