import { test, expect } from "@playwright/test";
import { registerFreshUser } from "./helpers";

test("browsing while logged out redirects to /auth when adding to cart", async ({ page }) => {
  await page.goto("/");

  const firstCard = page.getByTestId("add-to-cart").first();
  await expect(firstCard).toBeVisible();

  await firstCard.click();
  await page.waitForURL("/auth");
});

test("adding a product to the cart opens the drawer with a working checkout link", async ({ page }) => {
  await registerFreshUser(page, "Shopper");

  await page.getByTestId("add-to-cart").first().click();

  await expect(page.getByTestId("go-to-checkout")).toBeVisible();

  await page.getByTestId("go-to-checkout").click();
  await page.waitForURL("/checkout");
  await expect(page.getByTestId("checkout-address")).toBeVisible();
});
