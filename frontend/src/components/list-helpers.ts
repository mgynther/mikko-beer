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
