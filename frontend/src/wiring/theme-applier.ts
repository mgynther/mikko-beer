import type { Theme } from '../components/types/types'

export function applyTheme(theme: Theme): void {
  const bodyElements = document.getElementsByTagName('body')
  if (theme === 'DARK') {
    bodyElements[0].removeAttribute('class')
  } else {
    bodyElements[0].setAttribute('class', 'light')
  }
}
