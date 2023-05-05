export function stringToRGB(input: string, palette?: number[][]): string {
  const hsl = intToHSL(hashCode(input))
  const rgb = hslToRGB(hsl[0], hsl[1], hsl[2])

  if (!palette) {
    return 'rgb(' + rgb.join(', ') + ')'
  }

  return 'rgb(' + findClosestColor(rgb, palette).join(', ') + ')'
}

function hslToRGB(h: number, s: number, l: number): number[] {
  const a = s * Math.min(l, 1 - l)
  const f = (n: number, k: number = (n + h / 30) % 12) =>
    l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)

  return [
    Math.round(f(0) * 255),
    Math.round(f(8) * 255),
    Math.round(f(4) * 255),
  ]
}

function intToHSL(i: number): number[] {
  const hue = i % 360
  const saturation = (i % 50) + 40
  const lightness = (i % 40) + 30
  return [hue, saturation, lightness]
}

function hashCode(str: string): number {
  let hash = 0
  for (var i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  return hash
}

function findClosestColor(rgb: number[], palette: number[][]): number[] {
  let minDistance = Infinity
  let closestColor: number[] = [0, 0, 0]

  palette.forEach((color) => {
    const distance = Math.sqrt(
      Math.pow(rgb[0] - color[0], 2) +
        Math.pow(rgb[1] - color[1], 2) +
        Math.pow(rgb[2] - color[2], 2)
    )

    if (distance < minDistance) {
      minDistance = distance
      closestColor = color
    }
  })

  return closestColor
}
