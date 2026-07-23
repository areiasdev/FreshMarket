import type { Page } from "@playwright/test";

/** Registers a brand-new customer account (unique email per call) and leaves the page logged in on "/". */
export async function registerFreshUser(page: Page, namePrefix = "E2E User") {
  const unique = `${Date.now()}-${Math.floor(Math.random() * 10000)}`;
  const email = `e2e-${unique}@test.local`;
  const password = "Test1234!";

  await page.goto("/auth");
  await page.getByTestId("auth-tab-register").click();
  await page.locator('input[type="text"]').fill(`${namePrefix} ${unique}`);
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();

  await page.waitForURL("/");

  return { email, password };
}
