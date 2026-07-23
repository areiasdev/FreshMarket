import { test, expect } from "@playwright/test";
import { registerFreshUser } from "./helpers";

test("place a cash order at checkout, then cancel it from the order detail page", async ({ page }) => {
  await registerFreshUser(page, "Buyer");

  await page.goto("/");
  await page.getByTestId("add-to-cart").first().click();
  await page.getByTestId("go-to-checkout").click();
  await page.waitForURL("/checkout");

  await page.getByTestId("checkout-address").fill("Rua das Flores 123");
  await page.getByTestId("checkout-postal").fill("3810-193");
  await page.getByTestId("checkout-continue").click();

  await page.getByTestId("payment-method-cash").click();
  await page.getByTestId("checkout-pay").click();

  // Cash orders confirm immediately (no external redirect) and land on the order detail page.
  await page.waitForURL(/\/orders\/\d+/, { timeout: 15_000 });
  await expect(page.getByText(/Pending|Preparing/i).first()).toBeVisible();

  page.once("dialog", dialog => dialog.accept());
  await page.getByTestId("cancel-order").click();

  await expect(page.getByText(/Cancelled/i).first()).toBeVisible();
  await expect(page.getByTestId("cancel-order")).toHaveCount(0);
});
