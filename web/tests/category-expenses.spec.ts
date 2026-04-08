import { test, expect } from '@playwright/test';

test('category expenses page loads', async ({ page }) => {
  await page.goto('http://localhost:3000/category-expenses');
  await page.waitForLoadState('networkidle');

  await expect(page.getByRole('heading', { name: '카테고리별 지출 내역' })).toBeVisible();

  await page.screenshot({ path: 'category-expenses.png' });
});
