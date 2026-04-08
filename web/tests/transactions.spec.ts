import { test, expect } from '@playwright/test';

test('transactions page loads with calendar view', async ({ page }) => {
  await page.goto('http://localhost:3000/transactions');
  await page.waitForLoadState('networkidle');

  await expect(page.getByRole('heading', { name: '거래 내역' })).toBeVisible();

  await page.screenshot({ path: 'transactions.png', fullPage: true });
});
