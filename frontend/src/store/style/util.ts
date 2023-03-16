import { type Style, type StyleList, type StyleMap } from './types'

export function toStyleMap (list: StyleList | undefined): StyleMap {
  if (list === undefined) return {}

  const styleMap: Record<string, Style> = {}
  list.styles.forEach(style => {
    styleMap[style.id] = style
  })
  return styleMap
}
