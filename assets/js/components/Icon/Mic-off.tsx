import * as React from 'react'

export default function MicOffIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="4 4 16 16" width="100%" height="100%" fill="none" {...props}>
      <path
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M15.25 8.5V8a3.25 3.25 0 0 0-6.5 0v3.18c0 .047 0 .092.004.139.024.378.2 2.212 1.277 2.478M18.25 12.75s-.25 4.5-6.25 4.5c-.342 0-.666-.015-.972-.042M5.75 12.75s.105 1.891 1.814 3.222M12 17.75v1.5M18.25 5.75l-12.5 12.5"
      />
    </svg>
  )
}
