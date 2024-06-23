import { test, expect } from '@playwright/test'
import { localUrl } from './constants'

test('Site up', async ({ page }) => {
  await page.goto(localUrl)

  await expect(page).toHaveTitle(/Mikko Beer/)
})
