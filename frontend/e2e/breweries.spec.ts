import { test, expect } from '@playwright/test'
import { localUrl } from './constants'
import { login } from './login'

test('Brewery list', async ({ page }) => {
  await page.goto(localUrl)
  await login(page)

  await page.getByRole('link', { name: /breweries/i }).click()
  await expect(page.getByRole('heading', { name: 'Breweries' })).toBeVisible()
  await expect(page.getByText('Aecht')).toBeVisible()
})
