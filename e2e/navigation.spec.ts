import { test, expect } from '@playwright/test';

test('homepage has expected elements', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: /Master the USMLE/i })).toBeVisible();
  await expect(page.getByRole('link', { name: /Explore Question Banks/i })).toBeVisible();
});

test('login page renders correctly', async ({ page }) => {
  await page.goto('/login');
  await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();
  await expect(page.getByLabel(/Email address/i)).toBeVisible();
  await expect(page.getByLabel(/Password/i)).toBeVisible();
  await expect(page.getByRole('button', { name: /Log In/i })).toBeVisible();
});

test('store page lists question banks', async ({ page }) => {
  await page.goto('/store');
  await expect(page.getByRole('heading', { name: /Question Bank Directory/i })).toBeVisible();
});
