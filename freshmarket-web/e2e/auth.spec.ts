import { test, expect } from "@playwright/test";
import { registerFreshUser } from "./helpers";

test("register, sign out, and sign back in", async ({ page }) => {
  const { email, password } = await registerFreshUser(page);

  // Registering logs the user in immediately — confirm the navbar reflects it.
  await expect(page.getByTestId("nav-signout")).toBeVisible();

  await page.getByTestId("nav-signout").click();
  await expect(page.getByTestId("nav-signout")).toHaveCount(0);

  await page.goto("/auth");
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.locator('button[type="submit"]').click();

  await page.waitForURL("/");
  await expect(page.getByTestId("nav-signout")).toBeVisible();
});

test("login with wrong password shows an error instead of failing silently", async ({ page }) => {
  const { email } = await registerFreshUser(page);
  await page.getByTestId("nav-signout").click();

  await page.goto("/auth");
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill("WrongPassword1!");
  await page.locator('button[type="submit"]').click();

  await expect(page.getByText(/incorrect email or password/i)).toBeVisible();
});
