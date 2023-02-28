export enum PresenceStatus {
  Online = 'online',
  Focus = 'focus',
  Zen = 'zen',
}

export interface PresenceMode {
  status: PresenceStatus
  icon?: string
  color: string
  label: string
  desc: string
  keywords: string[]
  notifications: boolean
  shortcut?: string[]
}

export const Online: PresenceMode = {
  status: PresenceStatus.Online,
  icon: 'headphones',
  color: '$online',
  label: 'Online',
  keywords: ['available', 'present'],
  desc: 'Be present',
  notifications: true,
}

export const Focus: PresenceMode = {
  status: PresenceStatus.Focus,
  icon: 'headphones',
  color: '$focus',
  label: 'Focus',
  desc: 'Productive and responsive',
  keywords: [],
  notifications: true,
}

export const Zen: PresenceMode = {
  status: PresenceStatus.Zen,
  icon: 'sunrise',
  color: '$zen',
  label: 'Zen',
  desc: 'Calm, undisturbed',
  keywords: ['mindful', 'meditation', 'dnd', 'do not disturb'],
  notifications: false,
}

export const PresenceModes = [Online, Focus, Zen]

export function findModeByStatus(
  status: PresenceStatus
): PresenceMode | undefined {
  return PresenceModes.find((m) => m.status === status)
}
