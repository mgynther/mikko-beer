import { useEffect, useState } from 'react'

export function pad (number: number): string {
  if (number < 10) return `0${number}`
  return `${number}`
}

export function formatBestBefore (bb: string): string {
  const date = new Date(bb)
  const year = date.getFullYear()
  const month = pad(date.getMonth() + 1)
  const dayOfMonth = pad(date.getDate())
  return `${year}-${month}-${dayOfMonth}`
}

export function infiniteScroll (loadMore: () => void): () => void {
  const observer = new IntersectionObserver(entries => {
    const intersecting = entries[0].isIntersecting
    if (intersecting) {
      loadMore()
    }
  })
  const element = document.getElementById('content-end')
  if (element !== null) {
    observer.observe(element)
  }
  return () => {
    if (element != null) {
      observer.unobserve(element)
    }
  }
}

interface NamedItem {
  name: string
}

export function joinSortedNames (array: NamedItem[]): string {
  return array.map(i => i.name).sort().join(', ')
}

export function useDebounce (value: string, delay: number = 400): string {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}
