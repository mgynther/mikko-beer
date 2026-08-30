import type { Theme } from './types/types'

export function applyTheme(theme: Theme): void {
  const bodyElements = document.getElementsByTagName('body')
  if (theme === 'DARK') {
    bodyElements[0].removeAttribute('class')
  } else {
    bodyElements[0].setAttribute('class', 'light')
  }
}
