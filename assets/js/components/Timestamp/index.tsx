import { format, isThisWeek, isThisYear, isToday, isYesterday } from 'date-fns'
import React from 'react'

interface Props {
  date: string
  short?: boolean
}

export function Timestamp(props: Props) {
  return <>{ts(new Date(props.date), !!props.short)}</>
}

function ts(date: Date, short: boolean): string {
  if (isToday(date)) {
    return format(date, 'p')
  }

  if (isYesterday(date)) {
    return 'Yesterday'
  }

  if (isThisWeek(date)) {
    return format(date, 'EEEE')
  }

  if (isThisYear(date) && !short) {
    return format(date, 'MMMM do, p')
  } else if (isThisYear(date)) {
    return format(date, 'MMMM do')
  }

  return format(date, 'PPP')
}
