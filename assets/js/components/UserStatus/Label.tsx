import React from 'react'
import { Status } from 'state/entities'
import { findModeByStatus } from 'state/presence'

interface Props {
  status: Status | undefined
  isOnline: boolean
}

export function UserStatusLabel(props: Props) {
  if (!props.isOnline) {
    return <>'Offline'</>
  }

  if (
    props.status &&
    props.status.message &&
    props.status.message.trim().length > 16
  ) {
    return <>{props.status?.message}</>
  }

  return <>{props.status ? findModeByStatus(props.status.status)?.label : ''}</>
}
