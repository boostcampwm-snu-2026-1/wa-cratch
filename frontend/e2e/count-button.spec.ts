import { test, expect } from '@playwright/test';

test('버튼 클릭 시 카운트가 1 증가한다', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('button')).toContainText('0');
  await page.getByRole('button').click();
  await expect(page.getByRole('button')).toContainText('1');
});
