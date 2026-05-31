import { test, expect } from '@playwright/test';

test('내비게이션 바가 렌더링된다', async ({ page }) => {
  // Given
  await page.goto('/');
  // Then
  const nav = page.getByRole('navigation');
  await expect(nav.getByText('WaCratch')).toBeVisible();
  await expect(nav.getByRole('link', { name: '🔍 탐색하기' })).toBeVisible();
  await expect(nav.getByRole('link', { name: '로그인' })).toBeVisible();
  await expect(nav.getByRole('link', { name: /가입하기/ })).toBeVisible();
});

test('히어로 섹션이 렌더링된다', async ({ page }) => {
  // Given
  await page.goto('/');
  // Then
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.getByRole('link', { name: /지금 만들어보기/ })).toBeVisible();
  await expect(page.locator('.hero-mascot, [class*="heroMascot"]')).toBeVisible();
});

test('"어떻게 사용하나요?" 섹션이 렌더링된다', async ({ page }) => {
  // Given
  await page.goto('/');
  // Then
  await expect(page.getByText('어떻게 사용하나요?')).toBeVisible();
  await expect(page.getByText('블록 고르기')).toBeVisible();
  await expect(page.getByText('실행하기')).toBeVisible();
  await expect(page.getByText('친구와 공유')).toBeVisible();
});

test('CTA 섹션과 푸터가 렌더링된다', async ({ page }) => {
  // Given
  await page.goto('/');
  // Then
  await expect(page.getByText('와냥이와 시작해요!')).toBeVisible();
  await expect(page.getByRole('link', { name: /무료로 시작하기/ })).toBeVisible();
  await expect(page.getByRole('contentinfo').getByText('WaCratch', { exact: true }).first()).toBeVisible();
});
