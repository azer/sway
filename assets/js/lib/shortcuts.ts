const shortcutMap: Record<string, string> = {
  cmd: '⌘',
  opt: '⎇',
  alt: '⎇',
  shift: '⇧',
}

export function keySymbol(key: string): string {
  return shortcutMap[key] || shortcutMap[key.toLowerCase()] || key
}
