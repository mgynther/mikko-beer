import { test, expect } from '@playwright/test'
import { localUrl, styleName, styleOption, styleSearch } from './constants'
import { login } from './login'

test('Style list', async ({ page }) => {
  await page.goto(localUrl)
  await login(page)
  await page.getByRole('button', { name: /^more/i }).click()

  await page.getByRole('link', { name: /styles/i }).click()
  await expect(page.getByRole('heading', { name: 'Styles' })).toBeVisible()
  await page.getByRole('link', { name: styleName }).click()
  await expect(page.getByRole('heading', { name: styleName })).toBeVisible()
})

test('Style search', async ({ page }) => {
  await page.goto(localUrl)
  await login(page)
  await page.getByRole('button', { name: /^more/i }).click()

  await page.getByRole('link', { name: /styles/i }).click()
  await expect(page.getByRole('heading', { name: 'Styles' })).toBeVisible()
  await page.getByRole('combobox', { name: /search style/i }).fill(styleSearch)
  await page.getByRole('option', { name: styleOption }).click()
  await expect(page.getByRole('heading', { name: styleName })).toBeVisible()
})
