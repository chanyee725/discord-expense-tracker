import { test, expect } from '@playwright/test';

test('account management page loads', async ({ page }) => {
  await page.goto('http://localhost:3000/account-management');
  await page.waitForLoadState('networkidle');

  await expect(page.getByRole('heading', { name: '계좌 관리' }).first()).toBeVisible();

  await page.screenshot({ path: 'account-management.png', fullPage: true });
});
