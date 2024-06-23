import { type Page } from '@playwright/test'

import {
  localUrl,
  testUsername,
  testPassword
} from './constants'

export async function login (page: Page): Promise<void> {
  await page.goto(localUrl)

  await page.getByRole('textbox', { name: /username/i }).fill(testUsername)
  await page.getByRole('textbox', { name: /password/i }).fill(testPassword)
  await page.getByRole('button', { name: /login/i }).click()
}
