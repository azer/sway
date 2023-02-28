export function titleCase(text: string): string {
  return text.slice(0, 1).toUpperCase() + text.replace(/-/g, ' ').slice(1)
}

export function firstName(fullName: string): string {
  return fullName.split(' ')[0]
}
