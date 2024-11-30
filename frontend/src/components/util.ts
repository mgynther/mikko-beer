import { useEffect, useState } from 'react'

import {
  useNavigate as useRouterNavigate,
  useParams as useRouterParams
} from 'react-router-dom'
import type { InfiniteScroll, UseDebounce } from '../core/types'
import { className as contentEndClassName } from './ContentEnd'

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

export const infiniteScroll: InfiniteScroll = (loadMore: () => void) => {
  const observer = new IntersectionObserver(entries => {
    const intersecting = entries[0].isIntersecting
    if (intersecting) {
      loadMore()
    }
  })
  const element = document.getElementById(contentEndClassName)
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

export const useDebounce: UseDebounce = (
  value: string, delay = 300
): string => {
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

function useNavigate (): (url: string) => (void | Promise<void>) {
  return useRouterNavigate()
}

export interface NavigateIf {
  useNavigate: () => (url: string) => void
}

export const navigateIf: NavigateIf = {
  useNavigate
}

function useParams (): Record<string, string | undefined> {
  return useRouterParams()
}

export interface ParamsIf {
  useParams: () => Record<string, string | undefined>
}

export const paramsIf: ParamsIf = {
  useParams
}
