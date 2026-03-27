import type { Theme } from "./core/types"

export function applyTheme (theme: Theme): void {
  const bodyElements = document.getElementsByTagName('body')
  if (theme === 'DARK') {
    bodyElements[0].removeAttribute('class')
  } else {
    bodyElements[0].setAttribute('class', 'light')
  }
}
