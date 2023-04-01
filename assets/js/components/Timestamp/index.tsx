import { format, isThisWeek, isThisYear, isToday, isYesterday } from 'date-fns'
import React from 'react'

interface Props {
  date: string
}

export function Timestamp(props: Props) {
  return <>{ts(new Date(props.date))}</>
}

function ts(date: Date): string {
  if (isToday(date)) {
    return format(date, 'p')
  }

  if (isYesterday(date)) {
    return 'Yesterday'
  }

  if (isThisWeek(date)) {
    return format(date, 'EEEE')
  }

  if (isThisYear(date)) {
    return format(date, 'MMMM do, p')
  }

  return format(date, 'PPP')
}
