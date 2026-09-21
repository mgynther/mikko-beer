import { test, expect } from '@playwright/test'
import { v4 as uuidv4 } from 'uuid'
import { login } from './login'
import {
  breweryOption,
  brewerySearch,
  reviewContainer,
  styleOption,
  styleSearch,
} from './constants'

test('Add storage', async ({ page }) => {
  await login(page)
  await page.getByRole('link', { name: /storage/i }).click()

  const beerName = `e2e test beer ${uuidv4()}`
  await page.getByRole('textbox', { name: /name/i }).fill(beerName)
  await page
    .getByRole('combobox', { name: /search brewery/i })
    .fill(brewerySearch)
  await page.getByRole('option', { name: breweryOption }).click()
  await page.getByRole('combobox', { name: /search style/i }).fill(styleSearch)
  await page.getByRole('option', { name: styleOption }).click()
  await page.getByRole('button', { name: /create beer/i }).click()
  await page.locator('select').selectOption({ label: reviewContainer })
  await page.getByRole('textbox', { name: /best before/i }).fill('2026-05-05')
  await page.getByRole('button', { name: 'Create', exact: true }).click()
  await expect(page.getByRole('textbox', { name: /name/i })).toBeEmpty()
})
