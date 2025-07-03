/**
 * End-to-end tests for live-tracking using Playwright.
 *
 * Prerequisites:
 *   1. Backend running on http://localhost:5000
 *   2. Frontend (Vite) running on http://localhost:5173
 *   3. Test users & sample order exist in DB – supply credentials & orderId via env vars.
 *
 * Environment variables required (can be set in .env.test or export before run):
 *   CUSTOMER_EMAIL   – login email for customer
 *   CUSTOMER_PASS    – password for customer
 *   ADMIN_EMAIL      – login email for admin
 *   ADMIN_PASS       – password for admin
 *   TRACK_ORDER_ID   – Mongo _id of an order with active tracking for the customer
 */

const { test, expect } = require('@playwright/test');
require('dotenv').config({ path: '.env.test', override: true });

const BASE_URL = process.env.FRONTEND_URL || 'http://localhost:5173';

async function login(page, email, password) {
  await page.goto(`${BASE_URL}/login`);
  await page.fill('input[name=email]', email);
  await page.fill('input[name=password]', password);
  await page.click('button:has-text("Login")');
  await page.waitForNavigation();
}

test.describe('Live Tracking smoke-test', () => {
  const orderId = process.env.TRACK_ORDER_ID;
  const customerEmail = process.env.CUSTOMER_EMAIL;
  const customerPass = process.env.CUSTOMER_PASS;
  const adminEmail = process.env.ADMIN_EMAIL;
  const adminPass = process.env.ADMIN_PASS;

  if (!orderId || !customerEmail || !customerPass || !adminEmail || !adminPass) {
    test.skip(true, 'Required env vars not provided');
  }

  test('Customer: Track Live page loads & receives updates', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // ---- Login as customer ----
    await login(page, customerEmail, customerPass);

    // ---- Open Track page ----
    await page.goto(`${BASE_URL}/track/${orderId}`);

    // Wait for tracking call to finish
    const response = await page.waitForResponse(resp =>
      resp.url().includes(`/api/delivery-tracking/order/${orderId}`) && resp.status() === 200
    );
    expect(response.ok()).toBeTruthy();

    // Assert that live badge appears
    await expect(page.locator('text=Live').first()).toBeVisible();
  });

  test('Admin: Live deliveries map shows at least one marker', async ({ browser }) => {
    const context = await browser.newContext();
    const page = await context.newPage();

    // ---- Login as admin ----
    await login(page, adminEmail, adminPass);

    // ---- Open Live Deliveries Map ----
    await page.goto(`${BASE_URL}/dashboard/admin/delivery-tracking`);

    // Wait for map markers (leaflet-marker-icon class)
    await page.waitForSelector('.leaflet-marker-icon', { timeout: 10000 });
    const markers = await page.locator('.leaflet-marker-icon').count();
    expect(markers).toBeGreaterThan(0);
  });
});