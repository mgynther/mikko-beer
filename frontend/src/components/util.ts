import { useEffect, useState } from 'react'

import type { UseDebounce } from './types/types'

export function pad(number: number): string {
  if (number < 10) return `0${number}`
  return `${number}`
}

export function formatDateString(dateString: string): string {
  const date = new Date(dateString)
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const dayOfMonth = pad(date.getDate())
  return `${year}-${month}-${dayOfMonth}`
}

interface NamedItem {
  name: string
}

export function joinSortedNames(array: NamedItem[]): string {
  return array
    .map((i) => i.name)
    .sort()
    .join(', ')
}

// Didn't find a way to add type to this while keeping it generic.
export const useDebounce = <T>(value: T, delay = 300): [T, boolean] => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return (): undefined => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return [debouncedValue, value !== debouncedValue]
}

export const getUseDebounce = function <T>(): UseDebounce<T> {
  return useDebounce<T>
}
