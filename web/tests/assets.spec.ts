import { test, expect } from '@playwright/test';

test('assets page loads', async ({ page }) => {
  await page.goto('http://localhost:3000/assets');
  await page.waitForLoadState('networkidle');

  await expect(page.getByRole('heading', { name: '자산 현황' })).toBeVisible();

  await page.screenshot({ path: 'assets.png', fullPage: true });
});
