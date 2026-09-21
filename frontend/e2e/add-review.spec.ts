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

test('Add review', async ({ page }) => {
  await login(page)
  await page.getByRole('link', { name: /add review/i }).click()

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
  await page.getByRole('textbox', { name: /smell/i }).fill('Smells nice')
  await page.getByRole('textbox', { name: /taste/i }).fill('Tastes good')
  await page.getByRole('slider').fill('8')
  await page.getByRole('button', { name: 'Add', exact: true }).click()
  await expect(page.getByRole('heading', { name: beerName })).toBeVisible()
})
