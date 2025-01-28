export enum StatusModeKey {
  Online = 'online',
  Focus = 'focus',
  Zen = 'zen',
}

export interface StatusMode {
  mode: StatusModeKey
  icon?: string
  color: string
  label: string
  desc: string
  keywords: string[]
  notifications: boolean
  shortcut?: string[]
}

export const Online: StatusMode = {
  mode: StatusModeKey.Online,
  icon: 'headphones',
  color: '$online',
  label: 'Online',
  keywords: ['available', 'present'],
  desc: 'Be present',
  notifications: true,
}

export const Focus: StatusMode = {
  mode: StatusModeKey.Focus,
  icon: 'headphones',
  color: '$focus',
  label: 'Focus',
  desc: 'Productive and responsive',
  keywords: [],
  notifications: true,
}

export const Zen: StatusMode = {
  mode: StatusModeKey.Zen,
  icon: 'sunrise',
  color: '$zen',
  label: 'Zen',
  desc: 'Calm, undisturbed',
  keywords: ['mindful', 'meditation', 'dnd', 'do not disturb'],
  notifications: false,
}

export const StatusModes = [Online, Focus, Zen]

export function findStatusModeByKey(
  key: StatusModeKey
): StatusMode | undefined {
  return StatusModes.find((m) => m.mode === key)
}
