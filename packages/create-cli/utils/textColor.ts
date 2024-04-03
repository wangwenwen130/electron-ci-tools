export const textColor = (() => {
  const endColor = '\x1B[0m'
  const colorType = {
    red: '\x1B[31m',
    green: '\x1B[32m',
    yellow: '\x1B[33m',
    blue: '\x1B[34m',
    magenta: '\x1B[35m',
    cyan: '\x1B[36m',
    white: '\x1B[37m',
    gray: '\x1B[90m'
  }
  type ColorType = keyof typeof colorType
  const textColor: Record<ColorType, (txt: string) => string> = Object.keys(colorType).reduce(
    (pre, color) => {
      pre[color as ColorType] = (txt: string) => {
        return colorType[color as ColorType] + txt + endColor
      }
      return pre
    },
    {} as Record<ColorType, (txt: string) => string>
  )
  return textColor!
})()
