import {
  act as libraryAct,
  cleanup as libraryCleanup,
  render as libraryRender,
  waitFor as libraryWaitFor,
} from '@testing-library/react'
import type { ReactNode } from 'react'

// Wraps rendering with testing library so that tests depend on this file
// rather than on the library, and so that only what the tests use is available
// to them. The types are restated rather than taken from the library for the
// same reason: a query or an option that tests start to need is added here.

type Matcher = string | number | RegExp

interface RoleOptions {
  name: string | RegExp
}

export interface RenderResult {
  container: HTMLElement
  rerender: (ui: ReactNode) => void
  unmount: () => void
  getByDisplayValue: (value: Matcher) => HTMLElement
  getByLabelText: (text: Matcher) => HTMLElement
  getByPlaceholderText: (text: Matcher) => HTMLElement
  getByRole: (role: string, options?: RoleOptions) => HTMLElement
  getByTestId: (testId: string) => HTMLElement
  getByText: (text: Matcher) => HTMLElement
  getAllByRole: (role: string, options?: RoleOptions) => HTMLElement[]
  getAllByText: (text: Matcher) => HTMLElement[]
  queryByRole: (role: string, options?: RoleOptions) => HTMLElement | null
  queryByText: (text: Matcher) => HTMLElement | null
  queryAllByRole: (role: string, options?: RoleOptions) => HTMLElement[]
  findByRole: (role: string, options?: RoleOptions) => Promise<HTMLElement>
}

export function render(ui: ReactNode): RenderResult {
  const result = libraryRender(ui)
  return {
    container: result.container,
    rerender: result.rerender,
    unmount: result.unmount,
    getByDisplayValue: (value) => result.getByDisplayValue(value),
    getByLabelText: (text) => result.getByLabelText(text),
    getByPlaceholderText: (text) => result.getByPlaceholderText(text),
    getByRole: (role, options) => result.getByRole(role, options),
    getByTestId: (testId) => result.getByTestId(testId),
    getByText: (text) => result.getByText(text),
    getAllByRole: (role, options) => result.getAllByRole(role, options),
    getAllByText: (text) => result.getAllByText(text),
    queryByRole: (role, options) => result.queryByRole(role, options),
    queryByText: (text) => result.queryByText(text),
    queryAllByRole: (role, options) => result.queryAllByRole(role, options),
    findByRole: (role, options) => result.findByRole(role, options),
  }
}

export function waitFor<T>(callback: () => T | Promise<T>): Promise<T> {
  return libraryWaitFor(callback)
}

export function act(callback: () => Promise<void>): Promise<void> {
  return libraryAct(callback)
}

export function cleanup(): void {
  libraryCleanup()
}
