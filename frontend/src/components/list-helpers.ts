import { type ListDirection } from '../store/types'

export function getDirectionSymbol (
  direction: ListDirection | undefined
): string {
  if (direction === undefined) return ''
  switch (direction) {
    case 'asc': return '▲'
    case 'desc': return '▼'
    default: return ''
  }
}

export function invertDirection (
  direction: ListDirection | undefined
): ListDirection {
  if (direction === undefined) return 'desc'
  switch (direction) {
    case 'asc': return 'desc'
    case 'desc': return 'asc'
    default: return 'desc'
  }
}

export function formatTitle (
  base: string,
  isSelected: boolean,
  direction: ListDirection | undefined
): string {
  const directionSymbol = isSelected
    ? getDirectionSymbol(direction)
    : ''
  if (directionSymbol === '') {
    return base
  }
  return `${base} ${directionSymbol}`
}
