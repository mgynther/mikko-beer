import { useEffect, useState } from 'react'

import {
  useNavigate as useRouterNavigate,
  useParams as useRouterParams,
  useSearchParams as useRouterSearchParams
} from 'react-router'
import type { InfiniteScroll, UseDebounce } from '../core/types'
import { className as contentEndClassName } from './ContentEnd'

export function pad (number: number): string {
  if (number < 10) return `0${number}`
  return `${number}`
}

export function formatDateString (dateString: string): string {
  const date = new Date(dateString)
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
    if (element !== null) {
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

type NavigationFunc = (
  url: string,
  options?: { replace: boolean }
) => (void | Promise<void>)

function useNavigate (): NavigationFunc {
  return useRouterNavigate()
}

export interface NavigateIf {
  useNavigate: () => NavigationFunc
}

export const navigateIf: NavigateIf = {
  useNavigate
}

function useParams (): Record<string, string | undefined> {
  return useRouterParams()
}

export interface SearchParameters {
  get: (name: string) => string | undefined
}

function useSearch (): SearchParameters {
  const searchParams = useRouterSearchParams()[0]
  return {
    get: (name: string) => searchParams.get(name) ?? undefined
  }
}

export interface ParamsIf {
  useParams: () => Record<string, string | undefined>
  useSearch: () => SearchParameters
}

export const paramsIf: ParamsIf = {
  useParams,
  useSearch
}
